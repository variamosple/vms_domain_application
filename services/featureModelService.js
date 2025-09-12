var projectUtils = require('../utils/projectUtils');
var featuresModelUtils = require('../utils/featuresModelUtils');
var textUtils = require('../utils/textUtils');
var secretGraph = require('./secretGraph.json');
var { Graph } = require('../utils/graph.js');


function organize(featureModel) {
    let me = this;
    let rootFeature = featureModel.elements[0];
    let px = 100;
    let py = 100
    organizeFeature(featureModel, rootFeature, px, py)
    return;
}

function organizeFeature(featureModel, feature, px, py) {
    let me = this;
    let dx = 150;
    let dy = 100;
    let pxRet=px;
    feature.x=px;
    feature.y=py;
    for (let r = 0; r < featureModel.relationships.length; r++) {
        const relationship = featureModel.relationships[r];
        if (relationship.sourceId != feature.id) {
            continue;
        }
        let childElement=findElementById(featureModel, relationship.targetId);
        px = organizeFeature(featureModel, childElement, px, py + dy);  
        pxRet=px;
        px += dx; 
    } 
    return pxRet;
}

function findElementById(featureModel, id) {
    for (let e = 0; e < featureModel.elements.length; e++) {
        const element = featureModel.elements[e];
        if (element.id == id) {
            return element;
        }
    }
    return null;
}

//export methods
module.exports = { organize };