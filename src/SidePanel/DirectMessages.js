import React from "react";
import { Menu, Icon } from "semantic-ui-react";
import firebase from "../Firebase/firebase";
import { connect } from "react-redux";
import { setCurrentChannel, setPrivateChannel } from '../actions/index';
class DirectMessages extends React.Component {

    state = {
        users: [],
        user: this.props.currentUser,
        usersRef: firebase.database().ref('users'),
        connectedRef: firebase.database().ref('.info/connected'),
        presenceRef: firebase.database().ref('presence'),
        activeChannel: ' '
    }

    addListeners = (currentUserUid) => {
        let loadedUsers = [];
        this.state.usersRef.on('child_added', snap => {
            if (currentUserUid !== snap.key) {
                let user = snap.val();
                user['uid'] = snap.key;
                user['status'] = "offline";
                loadedUsers.push(user);
                this.setState({ users: loadedUsers });
            }
        });

        this.state.connectedRef.on('value', snap => {
            if (snap.val() === true) {
                const ref = this.state.presenceRef.child(currentUserUid);
                ref.set(true);
                ref.onDisconnect().remove(err => {
                    if (err !== null) {
                        console.log(err);
                    }
                })
            }
        })

        this.state.presenceRef.on('child_added', snap => {
            if (currentUserUid !== snap.key) {
                this.addStatusToUser(snap.key)
            }
        })

        this.state.presenceRef.on('child_removed', snap => {
            if (currentUserUid !== snap.key) {
                this.addStatusToUser(snap.key, false)
            }
        })
    }

    removeListeners = () => {
        this.state.presenceRef.off()
        this.state.connectedRef.off()
        this.state.usersRef.off()


    }
    addStatusToUser = (userID, connected = true) => {
        const updatedUsers = this.state.users.reduce((acc, user) => {
            if (user.uid === userID) {
                user['status'] = `${connected ? 'online' : 'offline'}`;
            }
            return acc.concat(user)
        }, [])
        this.setState({ users: updatedUsers });
    }
    componentDidMount() {
        if (this.state.user) {
            this.addListeners(this.state.user.uid);
        }
    }
    componentWillUnmount() {
        this.removeListeners();
    }

    isUserOnline = (user) => user.status === 'online';

    changeChannel = (user) => {
        const channelId = this.getChannelID(user.uid);
        const channelData = {
            id: channelId,
            name: user.name,
        }
        this.props.setCurrentChannel(channelData);
        this.props.setPrivateChannel(true);
        this.setActiveChannel(user.uid);
    }

    setActiveChannel = id => {
        this.setState({ activeChannel: id })
    }

    getChannelID = (userId) => {
        const currentUserId = this.state.user.uid;
        return userId < currentUserId ? `${userId}/${currentUserId}` : `${currentUserId}/${userId}`
    }


    render() {
        const { users, activeChannel } = this.state;
        return (
            <Menu.Menu className="menu">
                <Menu.Item>
                    <span>
                        <Icon name="mail" /> DIRECT MESSAGES
                    </span>{' '}
                    ({users.length})
                </Menu.Item>
                {users.map(user => (
                    <Menu.Item
                        key={user.uid}
                        onClick={() => this.changeChannel(user)}
                        style={{ opacity: 0.7, fontStyle: 'italic', color: "#fff" }}
                        active={user.uid === activeChannel}
                    >
                        <Icon
                            name='circle'
                            color={this.isUserOnline(user) ? 'green' : 'red'}
                        />
                        @{user.name}
                    </Menu.Item>
                ))
                }
            </Menu.Menu>
        )
    }
}




export default connect(null, { setCurrentChannel, setPrivateChannel })(DirectMessages);