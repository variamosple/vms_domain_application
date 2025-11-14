var projectUtils = require('../utils/projectUtils');
var featuresModelUtils = require('../utils/featuresModelUtils');
var textUtils = require('../utils/textUtils');
var secretGraph = require('./secretGraph.json');
var { Graph } = require('../utils/graph.js');


function organizeFeatureModel(req) {
    let me = this;
    let project = req.body.data.project;
    let modelId = req.body.data.modelSelectedId;
    let featureModel = projectUtils.findModel(project, modelId);
    if (!featureModel) {
        return project;
    }
    organize(featureModel);
    return project;
}


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
    let dx = 15;
    let dy = 115;
    feature.x = px;
    feature.y = py;
    let pxRet = px + feature.width + dx;
    let xmin = Number.MAX_SAFE_INTEGER;
    let xmax = Number.MIN_SAFE_INTEGER;
    for (let r = 0; r < featureModel.relationships.length; r++) {
        const relationship = featureModel.relationships[r];
        if (relationship.sourceId != feature.id) {
            continue;
        }
        let childElement = findElementById(featureModel, relationship.targetId);
        px = organizeFeature(featureModel, childElement, px, py + dy);
        pxRet = px;
        if (xmin > childElement.x) {
            xmin = childElement.x;
        }
        if (xmax < childElement.x + childElement.width) {
            xmax = childElement.x + childElement.width;
        }
    }
    if (xmin != Number.MAX_SAFE_INTEGER) {
        feature.x = ((xmin + xmax) / 2.0) - (feature.width / 2.0);
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
module.exports = { organizeFeatureModel, organize };