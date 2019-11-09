// downloaded from https://cdn.pika.dev/-/lit-element/2.2.1/dist-es2018/lit-element.min.js
import {html, svg, css, LitElement} from 'lit-element';
import {getColorSchemes} from '../../../lib/colorbrewer.js';
import '../../base/base-select.js';
import '../../base/base-button.js';
import '../../base/base-button-radio.js';

/**
* @polymer
* @extends HTMLElement
*/
class ClassificationSettings extends LitElement {
    static get properties() {
        return {
            classCount: {type: Number},
            classType: {type: String},
            colorSchemeType: {type: String},
            reverseColors: {type: Boolean},
            outlines: {type: Boolean},
            hideNulls: {type: Boolean},
            selectedColorScheme: {type: Number},
            noNulls: {type: Boolean, attribute: 'nonulls'},
            noEqual: {type: Boolean, attribute: 'noequal'},
            noMostFrequent: {type: Boolean, attribute: 'nomostfrequent'}
        }
    }
    constructor() {
        super();
        this.classCount = 1;
        this.classType = 'quantile';
        this.colorSchemeType = 'qual';
        this.reverseColors = false;
        this.outlines = true;
        this.hideNulls = false;
        this.selectedColorScheme = 0;
        this.noNulls = false;
        this.noEqual = false;
        this.noMostFrequent = false;
    }
    static get styles() {
        return css`
        #legendformcontainer {
            max-width: 320px;
            padding-left: 5px;
        }
        #colorschemes {
            display: flex;
            flex-wrap: wrap;
        }
        #colorschemes div {
            padding: 2px;
            margin: 2px;
            cursor: pointer;
        }
        #colorschemes div:hover {
            background-color: lightgray;
        }
        #colorschemes div.selected {
            background-color: darkgray;
        }
        #colorschemes svg {
            display: block;
        }
        #colorschemes rect {
            stroke: #333;
            stroke-width: 0.5;
        }
        `
    }
    render() {
        return html`
            <div id="legendformcontainer" @change="${(e)=>this._changed(e)}">
                <p><label>aantal klassen:</label><br>
                <base-select id="classcount" name="classcount">
                    <option value="1" ?selected="${this.classCount===1}">1</option>
                    <option value="2" ?selected="${this.classCount===2}">2</option>
                    <option value="3" ?selected="${this.classCount===3}">3</option>
                    <option value="4" ?selected="${this.classCount===4}">4</option>
                    <option value="5" ?selected="${this.classCount===5}">5</option>
                    <option value="6" ?selected="${this.classCount===6}">6</option>
                    <option value="7" ?selected="${this.classCount===7}">7</option>
                    <option value="8" ?selected="${this.classCount===7}">8</option>
                    <option value="9" ?selected="${this.classCount===7}">9</option>
                    <option value="10" ?selected="${this.classCount===7}">10</option>
                    <option value="11" ?selected="${this.classCount===7}">11</option>
                    <option value="12" ?selected="${this.classCount===7}">12</option>
                </base-select></p>
                <p>Classification methods:<br>
                <base-button-radio id="classtype" small>
                    <base-button value="interval">gelijke intervallen</base-button>
                    <base-button value="quantile" checked>kwantiel</base-button>
                    <base-button value="mostfrequent">meest voorkomend</base-button>
                </base-button-radio></p>
                <p>Color schemes:<br>
                <base-button-radio id='colorscheme' small>
                    <base-button value="seq">opvolgend</base-button>
                    <base-button value="div">uit elkaar</base-button>
                    <base-button value="qual" checked>categorie&euml;n</base-button>
                </base-button-radio><br>
                <input type="checkbox" name="colorsreversed" id="colorsreversed" ?checked="${this.reverseColors}"><label for="colorsreversed">reverse color order</label>
                <input type="checkbox" name="displayoutlines" id="displayoutlines" ?checked="${this.outlines}"><label for="displayoutlines">visual outlines</label><br>
                <input type="checkbox" id="hidenulls" name="hidenulls" ?checked="${this.hideNulls}" ?disabled="${this.noNulls}"><label for="hidenulls">Hide no-data</label>
                <div id="colorschemes">${this._renderColorSchemes()}</div>
                </p>
            </div>
        `
    }
    _renderColorSchemes() {
        if (!this.colorSchemes) {
            this.colorSchemes = getColorSchemes(this.classCount, this.colorSchemeType, this.reverseColors);
        }
        let classCount = this.colorSchemes[0].colors.length;
        if (this.selectedColorScheme > this.colorSchemes.length - 1) {
            this.selectedColorScheme = this.colorSchemes.length - 1;
        }
        return html`${this.colorSchemes.map((scheme, index)=>{
            return html`<div @click="${()=>this._schemeClicked(index)}" class="${index===this.selectedColorScheme?'selected':''}">
                ${svg`<svg width="15" height="${classCount * 15}">${
                    scheme.colors.map((color, index)=>svg`<rect fill="${color}" width="15" height="15" y="${index * 15}"></rect>`)
                }        
                </svg>`}
            </div>`
        })}`
    }
    _schemeClicked(index) {
        this.selectedColorScheme = index;
        this._changed();
    }
    getConfig() {
        return {
            classCount: this.classCount,
            classType: this.classType,
            reversed: this.reverseColors,
            schemeType: this.colorSchemeType,
            outlines: this.outlines,
            hideNulls: this.hideNulls,
            colors: this.colorSchemes[this.selectedColorScheme].colors.slice() //clone
        }
    }
    _changed(event) {
        if (event) {
            event.stopPropagation();
        }
        this.classCount = this.shadowRoot.querySelector('#classcount').value;
        //this.classType = this.shadowRoot.querySelector('input[name="classtype"]:checked').value;
        this.classType = this.shadowRoot.querySelector('#classtype').value;
        this.reverseColors = this.shadowRoot.querySelector('input[name="colorsreversed"]').checked;
        //this.colorSchemeType = this.shadowRoot.querySelector('input[name="colorscheme"]:checked').value;
        this.colorSchemeType = this.shadowRoot.querySelector('#colorscheme').value;
        this.outlines = this.shadowRoot.querySelector('input[name="displayoutlines"]').checked;
        this.hideNulls = this.shadowRoot.querySelector('input[name="hidenulls"]').checked;
        this.colorSchemes = getColorSchemes(this.classCount, this.colorSchemeType, this.reverseColors);
        if (this.selectedColorScheme > this.colorSchemes.length - 1) {
            this.selectedColorScheme = this.colorSchemes.length - 1;
        }
        this.dispatchEvent(new CustomEvent('change', {
            detail: this.getConfig(),
            bubbles: true,
            composed: true
        }))
    }
}

window.customElements.define('map-layer-config-legend', ClassificationSettings);