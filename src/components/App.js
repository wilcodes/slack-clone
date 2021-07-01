import React from "react";
import { Grid, GridColumn } from "semantic-ui-react";
import SidePanel from "../SidePanel/SidePanel";
import ColorPanel from "../ColorPanel/ColorPanel";
import Messages from "../Messages/Messages";
import MetaPanel from "../MetaPanel/MetaPanel";
import "./App.css";
import { connect } from "react-redux";
const App = ({ currentUser, currentChannel, isPrivateChannel, primaryColor, secondaryColor }) => {

    return (
        <Grid columns="equal" className="app" style={{ background: secondaryColor }}>
            <ColorPanel currentUser={currentUser} key={currentUser && currentUser.name} />
            <SidePanel
                key={currentChannel && currentUser.uid}
                currentUser={currentUser}
                primaryColor={primaryColor} />
            <Grid.Column style={{ marginLeft: 320 }}>
                <Messages
                    key={currentChannel && currentChannel.id}
                    currentChannel={currentChannel}
                    currentUser={currentUser}
                    isPrivateChannel={isPrivateChannel}
                    primaryColor={primaryColor}
                    secondaryColor={secondaryColor}
                />
            </Grid.Column>
            <Grid.Column width={4}>
                <MetaPanel
                    isPrivateChannel={isPrivateChannel}
                    key={currentChannel && currentChannel.name}
                    currentChannel={currentChannel}
                    currentUser={currentUser}

                />
            </Grid.Column>

        </Grid>

    )
};
const mapStateToProps = state => ({
    currentUser: state.user.currentUser,
    currentChannel: state.channel.currentChannel,
    isPrivateChannel: state.channel.isPrivateChannel,
    primaryColor: state.colors.primaryColor,
    secondaryColor: state.colors.secondaryColor
})
export default connect(mapStateToProps)(App);