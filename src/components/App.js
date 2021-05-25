import React from "react";
import { Grid, GridColumn } from "semantic-ui-react";
import SidePanel from "../SidePanel/SidePanel";
import ColorPanel from "../ColorPanel/ColorPanel";
import Messages from "../Messages/Messages";
import MetaPanel from "../MetaPanel/MetaPanel";
import "./App.css";
const App = () => {

    return (
        <Grid columns="equal" className="app" style={{background:"eee"}}>
            <ColorPanel />
            <SidePanel />
            <Grid.Column style={{marginLeft: 320}}>
                <Messages />
            </Grid.Column>
           <Grid.Column width={4}>
                <MetaPanel />    
           </Grid.Column>
           
        </Grid>

    )
};
export default App;