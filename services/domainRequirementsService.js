var projectUtils = require('../utils/projectUtils');
var featuresModelUtils = require('../utils/featuresModelUtils');
var domainRequirementsModelUtils = require('../utils/domainRequirementsModelUtils.js');
var featuresModelService = require('./featureModelService.js');
var textUtils = require('../utils/textUtils');
var secretGraph = require('./secretGraph.json');
var { Graph } = require('../utils/graph.js');
const { positiveUniversalMeasureValue } = require('docx');
const { GraphSecretUtils, GraphSecret } = require('../utils/graphSecret.js');

const wildCardStart = '[';
const wildCardEnd = ']';

async function generateFeaturesModel(req) {
    let project = req.body.data.project;
    let modelId = req.body.data.modelSelectedId;
    let domainRequirementsModel = projectUtils.findModel(project, modelId);
    if (!domainRequirementsModel) {
        return project;
    }

    let fw = 100;
    let fh = 66;
    let fx = 100;
    let fy = 100;
    let fdx = 25;
    let fdy = 100;
    let fi = 0;


    let dicRequirementFeature = [];
    let requirementsOfAttributes = [];

    for (let r = 0; r < domainRequirementsModel.relationships.length; r++) {
        const relationship = domainRequirementsModel.relationships[r];
        if (relationship.type == "FunctionalRequirement_FunctionalRequirement") {
            let type = projectUtils.findElementProperty(relationship, "Type").value;
            if (type == "Refinement") {
                let requirement = projectUtils.findModelElement(domainRequirementsModel, relationship.sourceId);
                if (requirement.type == "FunctionalRequirement") {
                    let description = projectUtils.findElementProperty(requirement, "Description").value;
                    let words = textUtils.getTextBetweenWords(description, "The", "attribute");
                    if (words.length == 1) {
                        requirementsOfAttributes.push(requirement);
                    }
                }
            }
        }
    }

    let productLine = projectUtils.findProductLine(project, modelId);
    let featureModel = projectUtils.findDomainModelByType(productLine, "Feature model with attributes");
    if (!featureModel) {
        featureModel = featuresModelUtils.createFeatureModel("Feature model with attributes");
        productLine.domainEngineering.models.push(featureModel);
        let rootFeature = featuresModelUtils.createRootFeature(project.name, fx, fy, fw, fh);
        featureModel.elements.push(rootFeature);
    } else {
        featureModel.elements = [];
        featureModel.relationships = [];
        let rootFeature = featuresModelUtils.createRootFeature(project.name, fx, fy, fw, fh);
        featureModel.elements.push(rootFeature);
    }

    let graphSecret=new GraphSecret(secretGraph); 
    let graph = graphSecret.graph;
    //showPaths(graph);
    fx += (fw + fdx)
    let requirements = getRequirements(graph, domainRequirementsModel, requirementsOfAttributes);
    createFeatures(domainRequirementsModel, featureModel, requirements, dicRequirementFeature, fx, fy, fw, fh, fdx, fdy);
    createConstraints(domainRequirementsModel, featureModel, requirements, dicRequirementFeature);

    featuresModelService.organize(featureModel);

    return project;
}

function containsAllFromPart(parts, indexes) {
    for (let i = 0; i < indexes.length; i++) {
        const index = indexes[i];
        let exists = false
        for (var key in parts) {
            var part = parts[key];
            if (part.tag == index) {
                exists = true;
            }
        }
        if (!exists) {
            return false
        }
    }
    return true;
}

function getValueFromPart(parts, indexes) {
    for (let i = 0; i < indexes.length; i++) {
        const index = indexes[i];
        for (var key in parts) {
            var part = parts[key];
            if (part.tag == index) {
                return part.word;
            }
        }
    }
    return null;
}

function getRequirements(graph, domainRequirementsModel) {
    let initialNodes = graph.findInitialNodes();
    let ret = [];
    for (let m = 0; m < domainRequirementsModel.elements.length; m++) {
        let element = domainRequirementsModel.elements[m];
        if (element.type == "FunctionalRequirement") {
            let description = projectUtils.findElementProperty(element, "Description").value;
            let parts = getSecretParts(graph, initialNodes, description);
            let item = {
                element: element,
                description: description,
                secret: parts
            }
            ret[element.id] = item;
        }
    }
    return ret;
}

function createFeatures(domainRequirementsModel, featuresModel, requirements, dicRequirementFeature, px, py, pw, ph, pdx, pdy) {
    let pi = 0
    for (var key in requirements) {
        if (requirements.hasOwnProperty(key)) {
            let requirement = requirements[key];
            if (requirement.description.includes("choose")) {
                let jjj = 0;
            }
            let secret = requirement.secret;
            if (secret) {
                if (containsAllFromPart(secret, ["1c_in", "6e_between"])) {
                    continue;
                }
                let name = generateName(secret); 
                if (name) {
                    //let feature = featuresModelUtils.createConcreteFeature(name, (pi * (pw + pdx)) + pdx, py + ph + pdy, pw, ph);
                    let feature = featuresModelUtils.createConcreteFeature(name, px + (pi * (pw + pdx)) + pdx, py, pw, ph);
                    featuresModel.elements.push(feature);
                    dicRequirementFeature[key] = feature;
                    pi++;
                }
            }
        }
    }
}

function generateName(secret) {
    let name = null;
    let verb = getValueFromPart(secret, ["4a_[process verb]", "4b_[process verb]", "4c_[process verb]"]);
    let obj = getValueFromPart(secret, ["6_[object/asset]"], ["6_[objects]"]);
    let as = getValueFromPart(secret, ["6_as"]);
    let parentesis = getValueFromPart(secret, ["8_("]);
    let additional = getValueFromPart(secret, ["8_[additional object details]"]);
    if (obj && !as && !parentesis && additional) {
        obj += ' ' + additional;
    }
    if (verb) {
        name = verb;
        if (obj) {
            name += ' ' + obj;
        }
    }
    if (!name) {
        let provide = getValueFromPart(secret, ["4b_provide"]);
        if (provide && obj) {
            name = obj;
        }
    }
    return name;
}

function createConstraints(domainRequirementsModel, featuresModel, requirements, dicRequirementFeature) {
    let rootFeature = featuresModel.elements[0];
    let processedRequirements=[];
 
    //Create bundles
    for (var key in requirements) {
        if (requirements.hasOwnProperty(key)) {
            let requirement = requirements[key]; 
            let secret = requirement.secret;
            if (secret) {
                let parentFeature = rootFeature;
                if (containsAllFromPart(secret, ["1c_in"])) {
                    if (containsAllFromPart(secret, ["6e_between"])) {
                        // if (!containsAllFromPart(secret, ["8_[additional object details]"])) {
                            let name = generateName(secret); 
                            if (name) {
                                //create bundle
                                let minValue = parseInt(getValueFromPart(secret, ["6e_[a]"]));
                                let maxValue = parseInt(getValueFromPart(secret, ["6e_[b]"]));
                                let bundle = featuresModelUtils.createBundle(name, minValue, maxValue, 200, 100, 100, 50);
                                featuresModel.elements.push(bundle);
                                dicRequirementFeature[key] = bundle;

                                let valueFeatureIncluded = getValueFromPart(secret, ["1c_[included feature]"]);
                                parentFeature = getFeatureByName(valueFeatureIncluded, dicRequirementFeature);

                                let type = parentFeature.type + "_Bundle";
                                let relationship = featuresModelUtils.createRelationship(parentFeature, bundle, type);
                                featuresModel.relationships.push(relationship);

                                processedRequirements.push(key);
                            }
                        // } 
                    } 
                } 
            }
        }
    }


    for (var key in requirements) {
        if (requirements.hasOwnProperty(key)) {
            if (processedRequirements.includes(key)) {
                continue;
            }
            let requirement = requirements[key];
            if (requirement.description.includes("font color")) {
                let jjj = 0;
            }
            let secret = requirement.secret;
            if (secret) {
                let parentFeature = rootFeature;
                if (containsAllFromPart(secret, ["1c_in"])) {
                    if (containsAllFromPart(secret, ["6e_between"])) {
                        if (containsAllFromPart(secret, ["8_[additional object details]"])) {
                            //create attribute in feature
                            let valueFeatureIncluded = getValueFromPart(secret, ["1c_[included feature]"]);
                            let propertyName = getValueFromPart(secret, ["6_[object/asset]"])
                            let strOptions = getValueFromPart(secret, ["8_[additional object details]"]);
                            let possibleValues = textUtils.normalizeTextList(strOptions);
                            let minValue = parseInt(getValueFromPart(secret, ["6e_[a]"]));
                            let maxValue = parseInt(getValueFromPart(secret, ["6e_[b]"]));
                            let constraint = '[' + minValue + '..' + maxValue + ']';
                            parentFeature = getFeatureByName(valueFeatureIncluded, dicRequirementFeature);
                            let property = featuresModelUtils.createProperty(propertyName, "String", "Undefined", possibleValues, constraint);
                            parentFeature.properties.push(property);
                        }
                        continue;
                    }
                    else {
                        //obtener caracteristica padre
                        let sourceRequirementId = requirement.element.id;
                        let refinedRequirements = domainRequirementsModelUtils.findTargetRequirements(domainRequirementsModel, sourceRequirementId, "FunctionalRequirement_FunctionalRequirement", "Refinement")
                        if (refinedRequirements.length == 0) {
                            let valueFeatureIncluded = getValueFromPart(secret, ["1c_[included feature]"]);
                            parentFeature = getFeatureByName(valueFeatureIncluded, dicRequirementFeature);
                        } else {
                            let valueFeatureIncluded = getValueFromPart(secret, ["1c_[included feature]"]);
                            parentFeature = getFeatureByName(valueFeatureIncluded, dicRequirementFeature);
                            for (let r = 0; r < refinedRequirements.length; r++) {
                                const refinedRequirement = refinedRequirements[r];
                                let element = dicRequirementFeature[refinedRequirement.id];
                                if (element) {
                                    parentFeature = element;
                                    break;
                                }
                            }
                        }
                    }
                }

                if (!parentFeature) {
                    continue;
                }

                if (parentFeature.type == "Bundle") {
                    let type = "Bundle_Feature";
                    let feature = dicRequirementFeature[key];
                    if (feature) {
                        //crear relacion bundle - feature
                        let relationship = featuresModelUtils.createRelationship(parentFeature, feature, type);
                        featuresModel.relationships.push(relationship);
                    }
                } else {
                    //crear relacion feature - feature
                    let type = null;
                    let value = getValueFromPart(secret, ["2_all"]);
                    if (value) {
                        type = "Mandatory";
                    } else {
                        let value = getValueFromPart(secret, ["2_some"]);
                        if (value) {
                            type = "Optional";
                        }
                    }
                    let feature = dicRequirementFeature[key];
                    if (feature) {
                        let relationship = featuresModelUtils.createRelationshipFeature_Feature(parentFeature, feature, type);
                        featuresModel.relationships.push(relationship);
                    }
                }

                if (true) {
                        //crear relaciones includes y excludes
                    let feature = dicRequirementFeature[key];
                    if (feature) {
                        let sourceRequirementId = requirement.element.id;
                        let conflictingRequirements = domainRequirementsModelUtils.findTargetRequirements(domainRequirementsModel, sourceRequirementId, "FunctionalRequirement_FunctionalRequirement", "Conflicting")
                        for (let i = 0; i < conflictingRequirements.length; i++) {
                            const conflictingRequirement = conflictingRequirements[i];
                            let element = dicRequirementFeature[conflictingRequirement.id];
                            if (element) {
                                let relationship = featuresModelUtils.createRelationshipFeature_Feature(feature, element, "Excludes");
                                featuresModel.relationships.push(relationship);
                            }
                        }


                        let dependencyRequirements = domainRequirementsModelUtils.findTargetRequirements(domainRequirementsModel, sourceRequirementId, "FunctionalRequirement_FunctionalRequirement", "Dependency")
                        for (let i = 0; i < dependencyRequirements.length; i++) {
                            const dependencyRequirement = dependencyRequirements[i];
                            let element = dicRequirementFeature[dependencyRequirement.id];
                            if (element) {
                                let relationship = featuresModelUtils.createRelationshipFeature_Feature(feature, element, "Includes");
                                featuresModel.relationships.push(relationship);
                            }
                        }
                    }
                }
            }
        }
    }

    
}

function getFeatureByName(name, dicRequirementFeature) {
    for (var key in dicRequirementFeature) {
        let feature = dicRequirementFeature[key];
        if (feature.name == name) {
            return feature;
        }
    }
    return null;
}

function getSecretParts(graph, initialNodes, description) {
    if (description.includes("choose")) {
        let jjj = 0;
    }
    let words = NormalizeWords(description);
    let coincidentPaths = [];
    for (let i = 0; i < initialNodes.length; i++) {
        const initialNode = initialNodes[i];
        let token = getTokenFromNode(initialNode);
        if (token == words[0]) {
            const paths = graph.findAllPaths(initialNode);
            for (let p = 0; p < paths.length; p++) {
                console.log(p);
                if (p == 66) {
                    let x = 0;
                }
                const path = paths[p];
                let candidateParts = checkPath(path, words);
                if (candidateParts != null) {
                    coincidentPaths.push(candidateParts);
                }
            }
        }
    }
    if (coincidentPaths.length > 0) {
        let p = 0;
        let maxL = 0;
        for (let c = 0; c < coincidentPaths.length; c++) {
            const coincidentPath = coincidentPaths[c];
            let l = countElements(coincidentPath);
            if (maxL < l) {
                maxL = l;
                p = c;
            }
        }
        return coincidentPaths[p];
    }
    return null;
}

function countElements(obj) {
    let count = 0;
    for (let key in obj) {
        if (obj.hasOwnProperty(key)) {
            count++;
        }
    }
    return count;
}


function checkPath(path, words) {
    showPath(path);
    let tokenCount = 0;
    for (let t = 0; t < path.length; t++) {
        index = path[t];
        token = getTokenFromNode(index);
        if (token != "//") {
            tokenCount++;
        }
    }
    let tokenCoincidences = [];
    let parts = null;
    let candidateParts = [];
    let w = 0;
    let wildCard = -1;
    let t = 0;
    for (let w = 0; w < words.length; w++) {
        const word = words[w];
        let index = null;
        let token = null;
        let tag = null;
        while (true) {
            index = path[t];
            tag = getTagFromNode(index);
            token = getTokenFromNode(index);
            if (token != "//") {
                break;
            } else {
                if (!tokenCoincidences.includes(index)) {
                    tokenCoincidences.push(index);
                }
            }
            if (t < path.length - 1) {
                t++;
            } else {
                if (t == wildCard) {
                    return null;
                }
            }
        }

        if (token == word) {
            let item = {
                word: word,
                key: token,
                tag: tag + '_' + token,
                id: index
            }
            candidateParts['_' + index] = item;
            wildCard = -1;
            if (!tokenCoincidences.includes(index)) {
                tokenCoincidences.push(index);
            }
            t++;
        } else {
            if (token.startsWith(wildCardStart)) {
                if (!candidateParts['_' + index]) {
                    let item = {
                        word: word,
                        key: token,
                        tag: tag + '_' + token,
                        id: index
                    }
                    candidateParts['_' + index] = item;
                } else {
                    candidateParts['_' + index].word = candidateParts['_' + index].word + ' ' + word;
                }
                wildCard = t;
                if (!tokenCoincidences.includes(index)) {
                    tokenCoincidences.push(index);
                }
                t++;
            }
            else {
                if (wildCard > -1) {
                    t = wildCard;
                    wildCard = -1;
                    w--;
                } else {
                    // t++;
                    return null;
                }
            }
        }
        if (w == words.length - 1) {
            if (path.length == tokenCoincidences.length) {
                for (let t = 0; t < path.length; t++) {
                    if (path[t] != tokenCoincidences[t]) {
                        return null;
                    }
                }
                return candidateParts;
            }
        }
    }
    return null;
}

function getSecretParts2(graph, initialNodes, description) {
    let parts = null;
    let tokens = tokenize(description);
    for (let i = 0; i < initialNodes.length; i++) {
        const initialNode = initialNodes[i];
        let word = getWordFromNode(initialNode);
        if (word == tokens[0]) {
            const paths = graph.findAllPaths(initialNode);
            let candidateParts = [];
            for (let p = 0; p < paths.length; p++) {
                console.log(p);
                const path = paths[p];
                if (p == 66) {
                    let x = 0;
                }
                let w = 0;
                for (let t = 0; t < tokens.length; t++) {
                    let token = tokens[t];
                    if (w >= path.length) {
                        break;
                    }
                    let index = path[w];
                    word = getWordFromNode(index);
                    if (word == "//") {
                        w++;
                        if (w >= path.length) {
                            break;
                        }
                        index = path[w];
                        word = getWordFromNode(index);
                    }
                    w++;
                    if (token == word) {
                        let item = {
                            word: token,
                            key: word,
                            id: index
                        }
                        if (token == "provide" && word == "provide") {
                            token = "provide";
                        }
                        candidateParts['_' + index] = item;
                        if (t == tokens.length - 1) {
                            parts = candidateParts;
                            break;
                        }
                    } else {
                        if (word.startsWith(wildCardStart)) {
                            let item = {
                                word: token,
                                key: word,
                                id: index
                            }
                            if (token == "provide" && word == "provide") {
                                token = "provide";
                            }
                            candidateParts['_' + index] = item;
                            if (t == tokens.length - 1) {
                                parts = candidateParts;
                                break;
                            }
                        } else {
                            break;
                        }
                    }
                }
                if (parts) {
                    break;
                }
            }
        }
    }

    return parts;
}

function getTokenFromNode(id) {
    let word = secretGraph.nodes[id].name;
    return word;
}

function getTagFromNode(id) {
    let tag = secretGraph.nodes[id].tag;
    return tag;
}

function NormalizeWords(text) {
    let str = text.toLowerCase();
    if (!str.endsWith(".")) {
        str += ".";
    }
    str = str.replace(/\./g, ' . ');
    str = str.replace(/\(/g, ' ( ');
    str = str.replace(/\)/g, ' ) ');
    str = str.replace(/\r/g, '');
    str = str.replace(/\n/g, '');
    str = str.trim();
    while (str.includes('  ')) {
        str = replaceDoubleSpacesWithSingle(str);
    }

    let tokens = str.split(' ');
    return tokens;
}

function replaceDoubleSpacesWithSingle(inputString) {
    return inputString.replace(/ {2}/g, ' ');
} 

function showPath(path) {
    let words = [];
    for (let j = 0; j < path.length; j++) {
        const id = path[j];
        let name = secretGraph.nodes[id].name;
        if (name != "//") {
            words.push(name);
        }
    }
    console.log(words.join(' '));
}




//export methods
module.exports = { generateFeaturesModel };