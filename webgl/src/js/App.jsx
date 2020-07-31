import React, { Component } from "react";
import { BrowserView, MobileView, isBrowser, isMobile } from "react-device-detect";

import AppMobile from "./AppMobile.jsx";
import AppDesktop from "./AppDesktop.jsx";


class App extends Component {
    constructor(props) {
        super(props)
    }

    renderBrowser () {
        return (
            <BrowserView>
                <AppDesktop/>
            </BrowserView>
        )
    }

    renderMobile () {
        return (
            <MobileView>
                <AppMobile/>
            </MobileView>
        )
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