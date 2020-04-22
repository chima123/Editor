import * as ReactDOM from "react-dom";
import * as React from "react";
import { Button } from "@blueprintjs/core";

import * as dat from "dat.gui";

export interface IKeyMapperProps {
    /**
     * Defines the current key being selected.
     */
    mappedKey: number;
    /**
     * Callback called on the button is clicked.
     */
    onChange: (key: number) => void;
}

export interface IKeyMapperState {
    /**
     * Defines the current key being selected.
     */
    mappedKey: number;
    /**
     * Sets wether or not the  user is setting a key.
     */
    settingKey: boolean;
}

export class KeyMapper extends React.Component<IKeyMapperProps, IKeyMapperState> {
    private _keyListener: (this: Window, ev: WindowEventMap["keyup"]) => void;

    /**
     * Constructor.
     * @param props the component's props.
     */
    public constructor(props: IKeyMapperProps) {
        super(props);
        this.state = {
            mappedKey: props.mappedKey,
            settingKey: false,
        };
    }

    /**
     * Renders the component.
     */
    public render(): React.ReactNode {
        let text = "";
        if (this.state.settingKey) {
            text = "Type key";
            window.addEventListener("keyup", this._keyListener = (ev) => {
                this._removeListener();
                this.setState({ mappedKey: ev.keyCode });
                this.props.onChange(ev.keyCode);
            });
        } else {
            text = `${this.state.mappedKey} (${String.fromCharCode(this.state.mappedKey)})`
        }

        return <Button style={{ height: "20px", marginTop: "2px", width: "calc(100% - 15px)" }} small={true} text={text} fill={true} onMouseOut={() => this._removeListener()} onClick={() => this.setState({ settingKey: true })} />;
    }

    /**
     * Removes the listener.
     */
    private _removeListener(): void {
        window.removeEventListener("keyup", this._keyListener);
        this.setState({ settingKey: false });
    }
}

export class KeyMapperController extends dat.controllers.Controller {
    private _title: HTMLSpanElement;

    /**
     * Constructor.
     * @param object the object to modify.
     * @param property the property of the object to get and set changes.
     */
    public constructor(object: any, property: string) {
        super(object, property);

        // Create title
        this._title = document.createElement("span");
        this._title.classList.add("property-name");
        this._title.innerHTML = String.fromCharCode(object[property]);
        this.domElement.appendChild(this._title);

        // Create div
        const div = document.createElement("div");
        div.classList.add("c");
        this.domElement.appendChild(div);

        // Render mapper
        ReactDOM.render(<KeyMapper onChange={(k) => object[property] = k} mappedKey={object[property]} />, div);
    }

    /**
     * Sets a new name for the field.
     * @param name the new name of the field.
     */
    public name(name: string): KeyMapperController {
        this._title.innerHTML = name;
        return this;
    }
}

dat.GUI.prototype.addKeyMapper = function(object: any, property: string): KeyMapperController {
    const controller = new KeyMapperController(object, property);

    // Create li element
    const li = document.createElement("li");
    li.classList.add("cr");
    li.classList.add("number");
    li.appendChild(controller.domElement);

    this.__ul.appendChild(li);

    // Finish
    this.onResize();
    controller.__li = li;
    controller.__gui = this;
    this.__controllers.push(controller);

    return controller;
}
