import React, { useState, useEffect } from "react";
import { Segment, Button, Input } from "semantic-ui-react";
import firebase from "../Firebase/firebase";
import FileModal from "./FileModal";
import { v4 } from "uuid";
import ProgressBar from "./ProgressBar";
import { Picker, emojiIndex } from "emoji-mart";
import 'emoji-mart/css/emoji-mart.css'


const MessageForm = (props) => {

    const [message, setMessage] = useState('');
    const [Isloading, setIsLoading] = useState(false);
    const [channel] = useState(props.currentChannel);
    const [user] = useState(props.currentUser);
    const [errors, setErrors] = useState([]);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [IsUpload, setIsUpload] = useState("");
    const [IsUploadTask, setIsUploadTask] = useState(null);
    const [storageRef] = useState(firebase.storage().ref())
    const [typingRef] = useState(firebase.database().ref('typing'))
    const [percentUpLoaded, setPercentUploaded] = useState(0);
    const [emojiPicker, setEmojiPicker] = useState(false)


    const openModal = () => (setIsModalOpen(true));

    const closeModal = () => (setIsModalOpen(false));

    const createMessage = (fileUrl = null) => {

        const messageDetails = {
            timeStamp: firebase.database.ServerValue.TIMESTAMP,
            user: {
                id: user.uid,
                name: user.displayName,
                avatar: user.photoURL,

            }

        }
        if (fileUrl !== null) {
            messageDetails['image'] = fileUrl;
        } else {
            messageDetails['content'] = message;
        }
        return messageDetails;
    }

    const sendMessage = () => {

        if (message) {
            setIsLoading(true);
            props.currentRef
                .child(channel.id)
                .push()
                .set(createMessage())
                .then(() => {
                    setIsLoading(false);
                    setMessage("");
                    setErrors([]);
                    typingRef.child(channel.id)
                        .child(user.uid)
                        .remove()

                })
                .catch(err => {
                    console.error(err);
                    setIsLoading(false);
                    setErrors([...errors, err]);
                }
                )
        } else {
            setErrors([...errors, 'Add a Message'])
        }
    };

    useEffect(() => {

        if (IsUploadTask !== null) {
            console.log("use effect")
            const pathToUpLoad = channel.id;
            const ref = props.messagesRef;
            IsUploadTask.on('state_changed', snap => {
                const percentupLoaded = Math.round(snap.bytesTransferred / snap.totalBytes) * 100;
                setPercentUploaded(percentupLoaded);

            }, err => {

                setErrors([...errors, err])
                setIsUpload('error')
                setIsUploadTask(null)
            },
                () => {
                    IsUploadTask.snapshot.ref.getDownloadURL().then(downloadUrl => {
                        sendFileMessage(downloadUrl, ref, pathToUpLoad);
                    })
                        .catch(err => {
                            console.log(err);
                            setErrors([...errors, err])
                            setIsUpload('error')
                            setIsUploadTask(null)
                        })
                })
            return (
                window.removeEventListener("state_changed", IsUploadTask.off)
            )
        }

    }, [IsUploadTask])

    const getPath = () => {
        if (props.IsPrivateChannel) {
            return `chat/private/${channel.id}`;
        } else {
            return 'chat/public'
        }
    }

    const uploadFile = (file, metadata) => {
        const filePath = `${getPath()}/${v4()}.jpg`;
        setIsUpload('uploading');
        setIsUploadTask(storageRef.child(filePath).put(file, metadata));
    }

    const sendFileMessage = (url, ref, path) => {
        ref.child(path)
            .push()
            .set(createMessage(url))
            .then(() => {
                setIsUpload('done')
            })
            .catch(err => {
                console.log(err)
                setErrors([...errors, err])
            })
    }
    const handleKeyDown = event => {

        if (event.keyCode === 13) {
            sendMessage();
        }
        if (message) {
            typingRef.child(channel.id)
                .child(user.uid)
                .set(user.displayName)
        } else {
            typingRef.child(channel.id)
                .child(user.uid)
                .remove()
        }
    }

    const handleTooglePicker = () => {
        setEmojiPicker(!emojiPicker)
    }

    const handleAddEmoji = (emoji) => {
        const oldMessage = message;
        const newMessage = colonToUnicode(`${oldMessage} ${emoji.colons}`)
        setMessage(newMessage)
        setEmojiPicker(false)



    }

    const colonToUnicode = message => {
        return message.replace(/:[A-Za-z0-9_+-]+:/g, x => {
            x = x.replace(/:/g, "");
            let emoji = emojiIndex.emojis[x];
            if (typeof emoji !== "undefined") {
                let unicode = emoji.native;
                if (typeof unicode !== "undefined") {
                    return unicode;
                }
            }
            x = ":" + x + ":";
            return x;
        });
    };

    return (
        <Segment className="message__Form">
            {emojiPicker && (
                <Picker
                    set="apple"
                    className="emojiPicker"
                    title="Pick your emoji"
                    emoji="point_up"
                    onSelect={handleAddEmoji}
                />
            )}
            <Input
                onKeyDown={handleKeyDown}
                fluid
                name="message"
                style={{ marginBottom: "0.7em" }}
                label={<Button icon={"add"} onClick={handleTooglePicker} content={emojiPicker ? "Close" : null} />}
                labelPosition='left'
                placeholder="Write Your Message"
                value={message}
                onChange={(event) => (setMessage(event.target.value))}

            />
            <Button.Group icon widths="2">
                <Button
                    color="orange"
                    content="Add Reply"
                    labelPosition="left"
                    icon="edit"
                    onClick={sendMessage}
                    disabled={Isloading}
                    style={{ background: props.primaryColor }}
                />
                <Button
                    content="Upload Media"
                    labelPosition="right"
                    icon="cloud upload"
                    onClick={openModal}
                    style={{ background: props.secondaryColor }}
                />
                <FileModal
                    modal={isModalOpen}
                    closeModal={closeModal}
                    uploadFile={uploadFile}
                    disabled={IsUpload === "uploading"}

                />

            </Button.Group>
            <ProgressBar
                percentUpLoaded={percentUpLoaded}
                IsUpload={IsUpload} />
        </Segment>
    )
};

export default MessageForm;