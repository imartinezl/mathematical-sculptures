import React, { Component } from "react";
import { BrowserView, MobileView, isBrowser, isMobile } from "react-device-detect";

import AppDesktop from "./AppDesktop.jsx";
import AppMobile from "./AppMobile.jsx";


class App extends Component {
    constructor(props) {
        super(props)
    }    

    render() {
        return (
            <div>
                <BrowserView>
                    <AppDesktop/>
                </BrowserView>
                <MobileView>
                    <AppMobile/>
                </MobileView>
            </div>
        )
    }
}

export default App;