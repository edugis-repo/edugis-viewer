import {LitElement, html} from 'lit-element';
import {settingsIcon, 
  visibleCircleIcon,
  invisibleCircleIcon, 
  arrowOpenedCircleIcon, 
  arrowForwardIcon,
  trashBinCircleIcon} from './my-icons';
import {panoramaWideIcon as areaIcon, showChartIcon as lineIcon, tripOriginIcon as circleIcon, 
    blurOnIcon as heatmapIcon, textFieldsIcon as textIcon, gridOnIcon as rasterIcon, 
    verticalAlignBottom as backgroundIcon, landscapeIcon, zoomInIcon, zoomOutIcon } from './my-icons';

import './map-slider';
import './map-legend-panel';
import mbStyleParser from '../utils/mbox-style-parse.js';
import colorbrewer from '../../lib/colorbrewer.js';

/**
* @polymer
* @extends HTMLElement
*/
class MapSelectedLayer extends LitElement {
  static get properties() { 
    return { 
      active: {type: Boolean},
      layer: {type: Object},
      zoom: {type: Number},
      boundspos: {type: String},
      updatecount: {type: Number},
      datagetter: {type: Object},
    }; 
  }
  constructor() {
    super();
    this.active = true;
    this.layer = undefined;
    this.zoom = 0;
    this.boundspos = "";
    this.updatecount = 0;
    this.percentage = 100;
    this.inrange = true;
    this.datagetter = {};
  }
  checkZoomRange()
  {
    const minzoom = this.layer.minzoom ? this.layer.minzoom : 0;
    const maxzoom = this.layer.maxzoom ? this.layer.maxzoom : 24;
    this.outofrange = this.zoom < minzoom || this.zoom > maxzoom;
  }
  shouldUpdate(changedProps) {
    if (changedProps.has('zoom')) {
      this.checkZoomRange();
    }
    if (changedProps.has('layer')) {
      // set layer defaults
      if (this.layer) {
        this.checkZoomRange();
        if (!this.layer.metadata) {
          this.layer.metadata = {};
        }
      }
      if (!this.layer.metadata.hasOwnProperty('legendvisible')) {
        this.layer.metadata.legendvisible = ((!this.layer.metadata.reference) && this.layer.type !== "background");
      }
    }
    return this.active;
  }
  render() {
    const layerIcon = this.getIcon(this.layer.type);
    return html`<style>
    .layercontainer {
      display: block;
      background: white;
      border-radius: 4px;
      padding: 10px;
      margin-top: 10px;
      box-shadow: 0 1px 2px 0 rgba(0,0,0,0.2);
    }
    .layercontainer:hover {
      box-shadow: 0 3px 6px rgba(0,0,0,0.16), 0 3px 6px rgba(0,0,0,0.23);
    }
    .titlebox {
      display: flex;
      justify-content: space-between;
      align-items: center;
    }
    .layertitle {
      text-align: center;
    }
    .lightgray {
      color: #ccc;
      fill: #ccc;
    }
    .iconbox {
      width: 86px;
      display: flex;
      justify-content: flex-end;
    }
    .iconcontainer {
      display: inline-block;
      cursor: pointer;
    }
    .closed {
      transform: rotate(-90deg);
      transform-origin: 13px 13px;
    }
    .legendcontainer {
      margin-top: 4px;
      border-top: 1px solid #F3F3F3;
      padding-top: 4px;
    }
    .direction {
      display: inline-flex;
      align-self: center;
    }
    .direction svg {
      height: 1em;
      width: 1em;
    }
    .SE {
      transform: rotate(45deg);
    }
    .S {
      transform: rotate(90deg);
    }
    .SW {
      transform: rotate(135deg);
    }
    .W {
      transform: rotate(180deg);
    }
    .NW {
      transform: rotate(225deg);
    }
    .N {
      transform: rotate(270deg);
    }
    .NE {
      transform: rotate(315deg);
    }
    </style>
    <div class="layercontainer">
      <div class="titlebox">
        <div class="${this.outofrange || this.layer.metadata.layervisible === false ?' lightgray':''}" title="${layerIcon.title}">${layerIcon.icon}</div> 
        <div class="layertitle${this.outofrange || this.layer.metadata.layervisible === false ?' lightgray':''}">${this.layer.metadata && this.layer.metadata.title?this.layer.metadata.title:this.layer.id}</div>
        <div class="iconbox">
          <div title="zichtbaarheid" class="iconcontainer" @click="${e=>this.toggleVisibility(e)}">${this.layer && this.layer.metadata && this.layer.metadata.layervisible === false?invisibleCircleIcon:visibleCircleIcon}</div>
          <div title="instellingen" class="iconcontainer" @click="${e=>this.toggleSettings(e)}">${settingsIcon}</div>          
          <div title="inklappen" class="iconcontainer${this.layer.metadata && this.layer.metadata.legendvisible && this.layer.metadata.layervisible!==false?'':' closed'}" @click="${e=>this.toggleLegend(e)}">${arrowOpenedCircleIcon}</div>
        </div>
      </div>
      ${this.renderSettings()}
      ${this.renderLegend()}
    </div>
    `;
  }
  getIcon(type) {
    let layerIcon = {icon: '', title: ''};
    switch (type) {
      case "fill":
          layerIcon = {icon: areaIcon, title: 'vlak'};
          break;
      case "line":
          layerIcon = {icon: lineIcon, title: 'lijn'};
          break;
      case "symbol":
          layerIcon = {icon: textIcon, title: 'tekst'};
          break;
      case "circle":
          layerIcon = {icon: circleIcon, title: 'cirkel'};
          break;
      case "heatmap":
          layerIcon = {icon: heatmapIcon, title: 'heatmap'};
          break;
      case "fill-extrusion":
          layerIcon = {icon: "3D", title: '3D'};
          break;
      case "raster":
          layerIcon = {icon: rasterIcon, title: 'raster'};
          break;
      case "hillshade":
          layerIcon = {icon: landscapeIcon, title: 'hillshade'};
          break;
      case "background":
          layerIcon = {icon: backgroundIcon, title: 'achtergrond'};
          break;
      default:
          break;
    }
    return layerIcon;
  }
  renderLegend(){
    if (this.layer && 
        this.layer.metadata && 
        this.layer.metadata.legendvisible &&
        this.layer.metadata.layervisible !== false ) {
        if (this.boundspos && this.boundspos != "") {
            return html`<div class="legendcontainer">Kaartlaag buiten kaartbeeld <span class="direction ${this.boundspos}">${arrowForwardIcon}</span></div>`
        }
        if (this.outofrange) {
          if (this.zoom < this.layer.minzoom) {
            return html`<div class="legendcontainer">Zoom verder in</div>`
          } else {
            return html`<div class="legendcontainer">Zoom verder uit</div>`
          }
        }
        return html`<div class="legendcontainer">
          <map-legend-panel .maplayer="${this.layer}" .zoom="${this.zoom}" .updatecount="${this.updatecount}"></map-legend-panel>
        </div>`;
    }
    return html``;
  }
  toggleLegend(e) {
    if (!this.layer.metadata) {
      this.layer.metadata = {};
    }
    if (this.layer.metadata.layervisible !== false) {
      this.layer.metadata.legendvisible = !this.layer.metadata.legendvisible;
    } else {
      this.toggleVisibility();
      this.layer.metadata.legendvisible = true;
    }
    this.updatecount++;
  }
  layerFeaturesVisible() {
    return (!this.outofrange) && this.layer.metadata.layervisible !== false;
  }
  renderSettings() {
    // ${(!this.outofrange) && this.layer.metadata && this.layer.metadata.legendvisible && this.layer.metadata.layervisible !== false?
          
    if (this.layer && this.layer.metadata && 
        this.layer.metadata.settingsvisible) {
      if (!this.layer.metadata.hasOwnProperty('opacity')) {
        switch (this.layer.type) {
          case 'hillshade':
            this.layer.metadata.opacity = this.layer.paint?
              this.layer.paint['hillshade-exaggeration']?
                this.layer.paint['hillshade-exaggeration']*100
              :50
            :50;
            break;
          default:
            this.layer.metadata.opacity = 100;
            break;
        }
      }
      return html`
      <style>
        .settingscontainer, .trashbincontainer {
          margin-top: 10px;
        }
        .transparencycontainer, .trashbincontainer {
          border-top: 1px solid #F3F3F3;
          padding-top: 4px;
        }
        .slidercontainer {
          margin-top: -10px;
          height: 40px;
          width: 168px;
          margin-left: 7px;
          --mdc-theme-primary: #ccc;
          --mdc-theme-secondary: #555;
        }
        .trashbinicon {
          float: right;
          cursor: pointer;
        }
        .percentage {
          display: inline-block;
          line-height: 14px;
          margin-left: 8px;
        }
        .label {
          display: inline-block;
          font-weight: bold;
        }
        .trashtext {
          padding-top: 10px;
        }
      </style>
      <div class="settingscontainer">
      <div class="trashbincontainer">
          <div class="label">Laag verwijderen</div>
          <div class="trashbinicon" @click="${e=>this.removeLayer(e)}" title="kaartlaag verwijderen">${trashBinCircleIcon}</div>
          <div class="trashtext">De laag kan weer toegevoegd worden via menu <i>Lagenselectie</i></div>
        </div>        
        ${this.layerFeaturesVisible()?html`
        <div class="transparencycontainer">
          <div class="label">Laag-transparantie:</div><div class="percentage">${100-this.layer.metadata.opacity}%</div>
          <div class="slidercontainer">
            <map-slider @slidervaluechange="${e=>this.updateTransparency(e)}" value="${100-this.layer.metadata.opacity}"></map-slider>
          </div>
        </div>
        ${this.renderIlluminationDirectionSlider()}
        <div class="editlegend">
        ${this.renderLegendEditor()}
        </div>`:''}
      </div>`
    }
  }
  renderIlluminationDirectionSlider()
  {
    if (this.layer.type !== 'hillshade') {
      return '';
    }
    if (!this.layer.metadata.paint) {
      this.layer.metadata.paint = {};
    }
    if (!this.layer.metadata.paint.hasOwnProperty('hillshade-illumination-direction')) {
      this.layer.metadata.paint['hillshade-illumination-direction'] = this.layer.paint?
        this.layer.paint['hillshade-illumination-direction']?
          this.layer.paint['hillshade-illumination-direction']
        :335
      :335;
    }
    return html`
      <div class="transparencycontainer">
        <div class="label">Lichtbron:</div><div class="percentage">${Math.round(this.layer.metadata.paint['hillshade-illumination-direction'])}&deg;</div>
        <div class="slidercontainer">
          <map-slider maxvalue="359" @slidervaluechange="${e=>this.updatePaintProperty(e, {"hillshade-illumination-direction": e.currentTarget.value})}" value="${this.layer.metadata.paint['hillshade-illumination-direction']}"></map-slider>
        </div>
      </div>
    `
  }
  legendEditorStyle() {
    return html`
    <style>
      .legendeditcontainer {
        border-top: 1px solid #F3F3F3;
        padding-top: 4px;
      }
      .legendeditcontainer {
        border-top: 1px solid #F3F3F3;
        padding-top: 4px;
      }
      .linewidthlabel {
        margin-top: 10px;                
      }
      .title {
        font-weight: bold;
        margin-bottom: 5px;
      }
      .sliderwidthcontainer {
        height: 55px;
        width: 168px;
        margin-top: -15px;
        margin-bottom: -10px;
        --mdc-theme-primary: #ccc;
        --mdc-theme-secondary: #555;
      }
    </style>`;
  }
  _getLayerStylePropertyName() {
      switch (this.layer.type) {
        case 'fill':
          return (this.layer.paint['fill-color'].property);
        case 'line':
          return (this.layer.paint['line-color'].property);
      }
  }
  _getMinMax(data, property) {
    const maxstr = 'zzzzzzzz';
    const result = {
      type: "undefined",
      min: Number.MAX_VALUE,
      max: Number.MIN_VALUE,
      minstr: maxstr,
      maxstr: '',
      undefinedcount: 0
    };
    if (data.length) {
      data.forEach(element=>{
        const value = element.properties[property];
        switch (typeof value) {
          case 'undefined':
            result.undefinedcount++;
          case 'number':
            if (value < result.min) {
              result.min = value;
            }
            if (value > result.max) {
              result.max = value;
            }
            break;
          case 'string':
            if (value < result.minstr) {
              result.minstr = value;
            }
            if (value > result.maxstr) {
              result.maxstr = value;
            }
            break;
        }
      });
    }
    if (result.minstr === maxstr) {
      result.minstr = '';
    }
    if (result.min > result.max) {
      result.min = result.max = 0;
    }
    return result;
  }
  _getDataProperties() {
    const stylePropertyName = this._getLayerStylePropertyName();
    let data;
    if (this.datagetter && this.datagetter.getSource) {
      const source = this.datagetter.getSource(this.layer.source);
      if (source.type === 'geojson') {
        data = source._data.features;
      }
    }
    if (!data) {
      if (this.datagetter && this.datagetter.querySourceFeatures) {
        data = this.datagetter.querySourceFeatures(this.layer.source, {sourceLayer: this.layer["source-layer"]});
      }
    }
    const minmax = this._getMinMax(data, stylePropertyName);
    return {property: stylePropertyName, minmax: minmax, values: data.map(item=>item.properties[stylePropertyName])}
  }

  getColorSchemes(numClasses, legendType) {
    return colorbrewer.filter(scheme=>scheme.type===legendType && scheme.sets.length > numClasses - 3)
      .map(scheme=>{
        const result = scheme.sets[numClasses - 3];
        result.name = scheme.name;
        result.type = scheme.type;
        return result;
      });
  }

  renderLegendEditor()
  {
    switch (this.layer.type) {
      case "fill":
        {
          const paint = this.layer.metadata.paint ? this.layer.metadata.paint : this.layer.paint;
          let fillColor = paint["fill-color"];
          let outlineColor = paint["fill-outline-color"];
          if (typeof fillColor === "string" && typeof outlineColor === "string")
          {
            fillColor = mbStyleParser.colorToHex(fillColor);
            outlineColor = mbStyleParser.colorToHex(outlineColor);
            return html`
            ${this.legendEditorStyle()}
            <div class="legendeditcontainer">
            <div class="title">Laag aanpassen</div>
            <input id="fillcolor" type="color" value="${fillColor}" @input="${e=>this.updatePaintProperty(e, {"fill-color": e.currentTarget.value})}"> <label for="fillcolor">vlakkleur</label><br>
            <input id="linecolor" type="color" value="${outlineColor}" @input="${e=>this.updatePaintProperty(e, {"fill-outline-color": e.currentTarget.value})}"> <label for="linecolor">lijnkleur</label>
            </div>
            `
          } else if (typeof fillColor === "string") {
            return html`
            ${this.legendEditorStyle()}
            <div class="legendeditcontainer">
            <div class="title">Laag aanpassen</div>
            <input id="fillcolor" type="color" value="${fillColor}" @input="${e=>this.updatePaintProperty(e, {"fill-color": e.currentTarget.value})}"> <label for="fillcolor">vlakkleur</label>
            </div>
            `
          } else {
            const legendInfo = mbStyleParser.paintStyleToLegendItems(fillColor, 'fill', this.zoom);
            this.legendType = legendInfo.type;
            if (!this.dataProperties) {
              this.dataProperties = this._getDataProperties();
            }
            if (legendInfo.items && legendInfo.items.length) {
              const numClasses = legendInfo.items.length;
              let schemes = this.getColorSchemes(numClasses, legendInfo.type);
              return html`
              <style>
                .schemescontainer {
                  display: flex;
                  flex-direction: row;
                  flex-wrap: wrap;
                }
                .colorscheme {
                  display: flex;
                  flex-direction: column;
                  margin-right: 1px;
                  cursor: pointer;
                  border: 2px solid white;
                }
                .colorscheme:hover {
                  border: 2px solid lightgray;
                }
                .color {
                  width: 15px;
                  height: 10px;
                  margin-bottom: 1px;
                  border: 1px solid gray;
                }
              </style>
              <div class="label">Kleurschema</div>
              <div class="schemescontainer">
              ${schemes.map(scheme=>
                  html`
                    <div class="colorscheme" @click="${e=>this.updateColorScheme(e, scheme)}">
                      ${scheme.colors.map(color=>
                          html`<div class="color" style="background-color: ${color};"></div>`
                      )}
                    </div>
                  `
              )}
              </div>
              <div class="label">Hoeveelheid dataklassen</div>
              <div class="classcontainer">
              Verschuif de grenslijnen om de klassewaarden te veranderen<br>
              <b>Name</b> ${this.dataProperties.property}<br>
              <b>Count</b> ${this.dataProperties.values.length}<br>
              <b>min</b> ${this.dataProperties.minmax.min}<br>
              <b>max</b> ${this.dataProperties.minmax.max}<br>
              <b>minstr</b> ${this.dataProperties.minmax.minstr}<br>
              <b>maxstr</b> ${this.dataProperties.minmax.maxstr}<br>
              <b>undefined</b> ${this.dataProperties.minmax.undefinedcount}<br>
              Hoeveelheid dataklassen <select @change="${e=>this.reclass(e)}">
                <option ?selected="${numClasses===3}" value="3">3</option>
                <option ?selected="${numClasses===4}" value="4">4</option>
                <option ?selected="${numClasses===5}" value="5">5</option>
                <option ?selected="${numClasses===6}" value="6">6</option>
                <option ?selected="${numClasses===7}" value="7">7</option>
                <option ?selected="${numClasses===8}" value="8">8</option>
                <option ?selected="${numClasses===9}" value="9">9</option>
              </select>
              <br>
              Verdeling van dataklassen<br>
              <button>Kwantiel</button><button>Interval</button><button>Willekeurig</button>
              </div>
              `
            }
          }
        }
        break;
      case "line":
        {
          const paint = this.layer.metadata.paint ? this.layer.metadata.paint : this.layer.paint;
          let lineColor = paint["line-color"];
          let lineWidth = paint["line-width"];
          if (typeof lineColor === "string") {
            lineColor = mbStyleParser.colorToHex(lineColor);
            return html`
            ${this.legendEditorStyle()}
            <div class="legendeditcontainer">
              <div class="title">Laag aanpassen</div>
              <input id="linecolor" type="color" value="${lineColor}" @input="${e=>this.updatePaintProperty(e, {"line-color": e.currentTarget.value})}"> <label for="linecolor">lijnkleur</label>
              <div class="linewidthlabel">
                Lijndikte: ${lineWidth}
                </div>
              <div class="sliderwidthcontainer">
                <map-slider @slidervaluechange="${e=>{this.layer.paint['line-width'] = e.detail.value / 10; this.updatePaintProperty(e, {"line-width": e.detail.value / 10})}}" value="${1 * lineWidth}"></map-slider>
              </div>
            </div>
            `
          }
        }
      default:
        break;
    }
    return html``;
  }
  updateColorScheme(e, scheme) {
    //console.log(scheme);
    this.currentSchemeName = scheme.name;
    const currentColor = this.layer.metadata.paint? this.layer.metadata.paint['fill-color']: this.layer.paint["fill-color"];
    if (Array.isArray(currentColor) && currentColor.length) {
      switch (currentColor[0]) {
        case "step":
          for (let j=0, i = 2; i < currentColor.length; i += 2, j++) {
            currentColor[i] = scheme.colors[j];
          }
          this.updatePaintProperty(e, {"fill-color": currentColor});
          break;
        case "match":
          currentColor[currentColor.length - 1] = scheme.colors[0];
          for (let j = 1, i = 3; i < currentColor.length; i +=2, j++) {
            currentColor[i] = scheme.colors[j];
          }
          this.updatePaintProperty(e, {"fill-color": currentColor});
          break;
      }
    } else if (currentColor === Object(currentColor)) {
      if (currentColor.stops) {
        currentColor.stops.forEach((stop, index)=>stop[1] = scheme.colors[index]);
        this.updatePaintProperty(e, {
          "fill-color": currentColor
        })
      }
    }
  }
  updatePaintProperty(e, propertyInfo)
  {
    //console.log(e.currentTarget.value);
    this.layer.metadata.paint = Object.assign({}, this.layer.paint, this.layer.metadata.paint, propertyInfo);
    propertyInfo.layerid = this.layer.id;
    this.dispatchEvent(new CustomEvent('changepaintproperty', {
      detail: propertyInfo,
      bubbles: true,
      composed: true,
    }));
    this.updatecount++;
  }
  toggleSettings(e) {
    if (!this.layer.metadata) {
      this.layer.metadata = {};
    }
    this.layer.metadata.settingsvisible = !this.layer.metadata.settingsvisible;
    this.updatecount++;
  }
  toggleVisibility() {
    if (this.toggleDebounce) {
        return;
    }
    this.toggleDebounce = true;
    if (!this.layer || !this.layer.metadata) {
      return;
    }
    this.updatecount++;
    if (this.layer.metadata.hasOwnProperty('layervisible')) {
      this.layer.metadata.layervisible = !this.layer.metadata.layervisible;
    } else {
      this.layer.metadata.layervisible = false;
    }
    this.dispatchEvent(
      new CustomEvent('updatevisibility', 
        {
          detail: {
            layerid: this.layer.id, 
            visible: this.layer.metadata.layervisible,
          },
          bubbles: true,
          composed: true
        }
      )
    );
    setTimeout(()=>this.toggleDebounce = false, 500);
  }
  updateTransparency(e) {
    this.layer.metadata.opacity = 100-Math.round(e.detail.value);
    e.detail.layerid = this.layer.id;
    this.updatecount++;
    this.dispatchEvent(
      new CustomEvent('updateopacity', 
        {
          detail: {
            layerid: this.layer.id, 
            opacity: this.layer.metadata.opacity / 100.0,
          },
          bubbles: true,
          composed: true
        }
      )
    );
  }
  reclass(e) {
    const newClassCount = e.currentTarget.value;
    this.numClasses = newClassCount;
    const schemes = this.getColorSchemes(newClassCount, this.legendType);
    let scheme;
    if (this.currentSchemeName) {
      scheme = schemes.find(scheme=>scheme.name===this.currentSchemeName);
      if (!scheme) {
        scheme = schemes[0];
      }
    } else {
      scheme = schemes[0];
    }
    
    /* equal interval */
    const interval = (this.dataProperties.minmax.max - this.dataProperties.minmax.min) / newClassCount;
    const paint = {
      "fill-color":[
      "step",
      ["get", this._getLayerStylePropertyName()],
      scheme.colors[0]
    ]};
    for (let i = 1; i < newClassCount; i++) {
      paint["fill-color"].push(i * interval, scheme.colors[i])
    }
    this.layer.metadata.paint = paint;
    this.updatePaintProperty(e, paint);
  }

  
  removeLayer(e) {
    this.dispatchEvent(
      new CustomEvent('removelayer',
        {
          detail: {layerid: this.layer.id},
          bubbles: true,
          composed: true
        })
    );
  }
}
customElements.define('map-selected-layer', MapSelectedLayer);
