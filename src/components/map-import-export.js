import {LitElement, html} from '@polymer/lit-element';
import './map-iconbutton';
import {openfileIcon, downloadIcon} from './my-icons';


/**
* @polymer
* @extends HTMLElement
*/
export default class MapImportExport extends LitElement {
  static get properties() { 
    return {
      active: {type: Boolean},
      map: {type: Object}
    }; 
  }
  constructor() {
      super();
      this.map = null;
      this.active = false;
  }
  createRenderRoot() {
    return this;
  }
  shouldUpdate(changedProp){
    return true;
  }
  render() {
    if (!this.active) {
      return html``;
    }
    return html`
      <style>
      .buttoncontainer {display: inline-block; width: 20px; height: 20px; border: 1px solid gray; border-radius:4px;padding:2px;fill:gray;}
      .right {float: right; margin-left: 4px;}
      .dropzone {display: inline-block; height: 24px; width: 200px; border: 1px dashed gray; border-radius: 2px;}
      .dragover {background-color: lightgray;}
      </style>
      <div class="drawcontainer" @dragover="${e=>e.preventDefault()}" @drop="${(e)=>this._handleDropZoneDrop(e)}">
      <input type="file" id="fileElem" accept=".json" style="display:none" @change="${e=>this._openFiles(e)}">
      ${window.saveAs ? html`<div class="buttoncontainer right" @click="${(e)=>this._saveFile()}"><map-iconbutton info="opslaan" .icon="${downloadIcon}"></map-iconbutton></div>`: ''}
      ${window.saveAs ? html`<div class="buttoncontainer right" @click="${(e)=>this.querySelector('#fileElem').click()}"><map-iconbutton info="open file" .icon="${openfileIcon}"></map-iconbutton></div>`: ''}
      ${window.saveAs ? html`<div class="dropzone right" @dragover="${e=>e.target.classList.add('dragover')}" @dragleave="${e=>e.target.classList.remove('dragover')}">drop config json here</map-iconbutton></div>`: ''}
      </div>
    `
  }
  _saveFile(e) {
    const center = this.map.getCenter();

    const json = {
        map: { zoom: this.map.getZoom(),center: [center.lng, center.lat], pitch: this.map.getPitch(), bearing: this.map.getBearing()},
        datacatalog: [],
        tools: this.toollist.reduce((result, tool)=>{
            result[tool.name] = {};
            if (tool.hasOwnProperty('opened')) {result[tool.name].opened = tool.opened};
            if (tool.hasOwnProperty('visible')) {result[tool.name].visible = tool.visible};
            if (tool.hasOwnProperty('position')) {result[tool.name].position = tool.position};
            if (tool.hasOwnProperty('order')) {result[tool.name].order = tool.order};
            return result;},{}),
        keys: {}
    }
    const blob = new Blob([JSON.stringify(json, null, 2)], {type: "application/json"});
    window.saveAs(blob, 'edugismap.json');
  }

  static _readFileAsText(inputFile) {
    const reader = new FileReader();
  
    return new Promise((resolve, reject) => {
      reader.onerror = () => {
        reader.abort();
        reject(new DOMException("Problem parsing input file."));
      };
  
      reader.onload = () => {
        resolve(reader.result);
      };
      reader.readAsText(inputFile);
    });
  };
  static async _readFile(file)
  {
    try {
        const text = await MapImportExport._readFileAsText(file);
        return MapImportExport._processGeoJson(text);
    } catch(error) {
        return {error: error}
    }
  }
  _openFiles(e) {
    const file = this.querySelector('#fileElem').files[0];
    MapImportExport._readFileAsText(file);
  }
  static _processGeoJson(data) {
    try {
      const json = JSON.parse(data);
      return json;
    } catch(error) {
      return {error: 'invalid json'};
    }
  }
  static async handleDrop(ev) {
    ev.preventDefault();
    if (ev.dataTransfer.items) {
      // Use DataTransferItemList interface to access the file(s)
      for (let i = 0; i < ev.dataTransfer.items.length; i++) {
        // If dropped items aren't files, reject them
        if (ev.dataTransfer.items[i].kind === 'file') {
            let file = ev.dataTransfer.items[i].getAsFile();
            return await MapImportExport._readFile(file);
        }
      }
    } else {
      // Use DataTransfer interface to access the file(s)
      for (var i = 0; i < ev.dataTransfer.files.length; i++) {
        return await MapImportExport._readFile(ev.dataTransfer.files[i])
      }
    }
    return {}
  }
  _handleDropZoneDrop(ev) {
    this.querySelector('.dropzone').classList.remove('dragover');
    const json = MapImportExport.handleDrop(ev);
    if (json.error) {
        alert('error: ' + json.error);
    } else {
        if (json.map && json.datacatalog && json.tools && json.keys) {
            return json;
        } else {
            alert ('this json file is not recognized as an EduGIS configuration');
        }
    }
  }

}
customElements.define('map-import-export', MapImportExport);
