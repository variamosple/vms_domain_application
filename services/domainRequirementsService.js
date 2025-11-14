var projectUtils = require('../utils/projectUtils');
var featuresModelUtils = require('../utils/featuresModelUtils');
var domainRequirementsModelUtils = require('../utils/domainRequirementsModelUtils.js');
var featuresModelService = require('./featureModelService.js');
var textUtils = require('../utils/textUtils');
var functionalRequirementsGraph = require('./secretGraph.json');
var nonFunctionalRequirementsGraph = require('./secretGraphNFR.json');
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
    let fh = 75;
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

    let graphSecretFR = new GraphSecret(functionalRequirementsGraph);
    let graphSecretNFR = new GraphSecret(nonFunctionalRequirementsGraph);
    fx += (fw + fdx)
    let functionalRequirements = getRequirements(graphSecretFR, domainRequirementsModel, requirementsOfAttributes);
    let nonFunctionalRequirements = getNonFunctionalRequirements(graphSecretNFR, domainRequirementsModel, requirementsOfAttributes);
    createFeatures(domainRequirementsModel, featureModel, functionalRequirements, nonFunctionalRequirements, dicRequirementFeature, fx, fy, fw, fh, fdx, fdy);
    createConstraints(domainRequirementsModel, featureModel, functionalRequirements, dicRequirementFeature);

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

function getRequirements(graphSecret, domainRequirementsModel) {
    let graph = graphSecret.graph;
    let initialNodes = graph.findInitialNodes();
    let ret = [];
    for (let m = 0; m < domainRequirementsModel.elements.length; m++) {
        let element = domainRequirementsModel.elements[m];
        if (element.type == "FunctionalRequirement") {
            let description = projectUtils.findElementProperty(element, "Description").value;
            let parts = graphSecret.getSecretParts(initialNodes, description);
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

function getNonFunctionalRequirements(graphSecret, domainRequirementsModel) {
    let graph = graphSecret.graph;
    let initialNodes = graph.findInitialNodes();
    let ret = [];
    for (let m = 0; m < domainRequirementsModel.elements.length; m++) {
        let element = domainRequirementsModel.elements[m];
        if (element.type == "NonFunctionalRequirement") {
            let description = projectUtils.findElementProperty(element, "Description").value;
            let parts = graphSecret.getSecretParts(initialNodes, description);
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

function createFeatures(domainRequirementsModel, featuresModel, requirements, nonFunctionalRequirements, dicRequirementFeature, px, py, pw, ph, pdx, pdy) {
    let machineLearningRequirements = getMachineLearningRequirements(nonFunctionalRequirements);
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
                    let feature = null;
                    if (machineLearningRequirements.hasOwnProperty(name)) {
                        let isOptional = machineLearningRequirements[name];
                        if (isOptional) {
                            feature = featuresModelUtils.createAbstractFeature(name, px + (pi * (pw + pdx)) + pdx, py, pw * 2, ph);
                            feature.isML = true;
                            featuresModel.elements.push(feature);
                            //create bundle
                            let minValue = 1;
                            let maxValue = 2;
                            let bundle = featuresModelUtils.createBundle(name, minValue, maxValue, 200, 100, 100, 50);
                            featuresModel.elements.push(bundle);
                            parentFeature = feature;
                            let type = parentFeature.type + "_Bundle";
                            let relationship = featuresModelUtils.createRelationship(parentFeature, bundle, type);
                            featuresModel.relationships.push(relationship);

                            let concretefeature = featuresModelUtils.createConcreteFeature(name, px + (pi * (pw + pdx)) + pdx, py, pw, ph);
                            featuresModel.elements.push(concretefeature);
                            type = "Bundle_Feature";
                            relationship = featuresModelUtils.createRelationship(bundle, concretefeature, type);
                            featuresModel.relationships.push(relationship);
                            concretefeature = featuresModelUtils.createMLBasedFeature(name, px + (pi * (pw + pdx)) + pdx, py, pw * 2, ph);
                            featuresModel.elements.push(concretefeature);
                            type = "Bundle_Feature";
                            relationship = featuresModelUtils.createRelationship(bundle, concretefeature, type);
                            featuresModel.relationships.push(relationship);
                        } else {
                            feature = featuresModelUtils.createMLBasedFeature(name, px + (pi * (pw + pdx)) + pdx, py, pw * 2, ph);
                            featuresModel.elements.push(feature);
                        }
                    } else {
                        feature = featuresModelUtils.createConcreteFeature(name, px + (pi * (pw + pdx)) + pdx, py, pw, ph);
                        featuresModel.elements.push(feature);
                    }
                    dicRequirementFeature[key] = feature;
                    pi++;

                }
            }
        }
    }
}

function getMachineLearningRequirements(nonFunctionalRequirements) {
    let ret = [];
    for (var key in nonFunctionalRequirements) {
        if (nonFunctionalRequirements.hasOwnProperty(key)) {
            let requirement = nonFunctionalRequirements[key];
            let secret = requirement.secret;
            if (secret) {
                if (containsAllFromPart(secret, ["2_it", "4d_implemented"])) {
                    let valueFeatureIncluded = getValueFromPart(secret, ["1c_[included feature]"]);
                    ret[valueFeatureIncluded] = true;
                    if (containsAllFromPart(secret, ["3_shall"])) {
                        ret[valueFeatureIncluded] = false;
                    }
                }
            }
        }
    }
    return ret;
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
    let processedRequirements = [];

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






//export methods
module.exports = { generateFeaturesModel };