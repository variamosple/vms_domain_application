const config = require('./config.js');
var express = require('express');
var cors = require('cors');

var domainRequirementsService = require('./services/domainRequirementsService');
var featureModelService = require('./services/featureModelService.js');
var mapModelService = require('./services/mapModelService');
var graphModelService = require('./services/graphModelService');
var serenaTransfrmations = require('./services/serenaTransformations.js');
var applicationGenerationService = require('./services/applicationGenerationService.js');
var applicationCodeGenerationService = require('./services/applicationCodeGenerationService.js');
var featureComponentBindingModelService = require('./services/featureComponentBindingModelService.js');
var autocompleteService = require("./services/autocompleteService");
var additionalRequirements = require('./services/additionalRequirements');
var relatedRequirementsService = require('./services/relatedRequirementsService');
var relatedRequirementsApplicationService = require('./services/relatedRequirementsApplicationService');
var generate = require('./services/generateSRS');

var app = express(); 

 
app.use(express.json({limit: '50mb'}));
app.use(express.urlencoded({limit: '50mb'}));


app.use(cors());

app.get('/', async function (req, res, next) {
    try {
        res.setHeader('Content-Type', 'application/json');
        let data = {
            message: "vms_domain_application",
            version: config.VERSION
        }
        res.end(JSON.stringify(data));
    } catch (error) {
        res.status(400).send(JSON.stringify(error));
    }
});

app.get('/version', async function (req, res, next) {
    try {
        res.setHeader('Content-Type', 'application/json');
        let data = {
            message: "vms_domain_application",
            version: config.VERSION
        }
        res.end(JSON.stringify(data));
    } catch (error) {
        res.status(400).send(JSON.stringify(error));
    }
});

app.post('/generateFeaturesModelFromDomainRequirements', async function (req, res, next) {
    try {
        console.log(req.body.data)
        res.setHeader('Content-Type', 'application/json');
        let project = await domainRequirementsService.generateFeaturesModel(req);
        console.log(project);
        let contentResponse = {
            transactionId: "1",
            message: "Completed.",
            data: {
                content: project
            }
        }
        res.end(JSON.stringify(contentResponse));
    } catch (error) {
        res.status(400).send(JSON.stringify(error));
    }
});

app.post('/organizeFeatureModel', async function (req, res, next) {
    try {
        console.log(req.body.data)
        res.setHeader('Content-Type', 'application/json');
        let project = featureModelService.organizeFeatureModel(req);
        console.log(project);
        let contentResponse = {
            transactionId: "1",
            message: "Completed.",
            data: {
                content: project
            }
        }
        res.end(JSON.stringify(contentResponse));
    } catch (error) {
        res.status(400).send(JSON.stringify(error));
    }
});

app.post('/generateCriteriaModelFromApplicationRequirements', async function (req, res, next) {
    try {
        console.log(req.body.data)
        res.setHeader('Content-Type', 'application/json');
        let project = await serenaTransfrmations.generateCriteriaModel(req);
        console.log(project);
        let contentResponse = {
            transactionId: "1",
            message: "Completed.",
            data: {
                content: project
            }
        }
        res.end(JSON.stringify(contentResponse));
    } catch (error) {
        res.status(400).send(JSON.stringify(error));
    }
});
app.post('/generateGoalModelFromApplicationRequirements', async function (req, res, next) {
    try {
        console.log(req.body.data)
        res.setHeader('Content-Type', 'application/json');
        let project = await serenaTransfrmations.generateGoalModel(req);
        console.log(project);
        let contentResponse = {
            transactionId: "1",
            message: "Completed.",
            data: {
                content: project
            }
        }
        res.end(JSON.stringify(contentResponse));
    } catch (error) {
        res.status(400).send(JSON.stringify(error));
    }
});

app.post('/generateRiskModelFromApplicationRequirements', async function (req, res, next) {
    try {
        console.log(req.body.data)
        res.setHeader('Content-Type', 'application/json');
        let project = await serenaTransfrmations.generateRiskModel(req);
        console.log(project);
        let contentResponse = {
            transactionId: "1",
            message: "Completed.",
            data: {
                content: project
            }
        }
        res.end(JSON.stringify(contentResponse));
    } catch (error) {
        res.status(400).send(JSON.stringify(error));
    }
});
app.post('/generateTreatmentModelFromApplicationRequirements', async function (req, res, next) {
    try {
        console.log(req.body.data)
        res.setHeader('Content-Type', 'application/json');
        let project = await serenaTransfrmations.generateTreatmentModel(req);
        console.log(project);
        let contentResponse = {
            transactionId: "1",
            message: "Completed.",
            data: {
                content: project
            }
        }
        res.end(JSON.stringify(contentResponse));
    } catch (error) {
        res.status(400).send(JSON.stringify(error));
    }
});
app.post('/generateSerenaModelFromApplicationRequirements', async function (req, res, next) {
    try {
        console.log(req.body.data)
        res.setHeader('Content-Type', 'application/json');
        let project = await serenaTransfrmations.generateSerenaModel(req);
        console.log(project);
        let contentResponse = {
            transactionId: "1",
            message: "Completed.",
            data: {
                content: project
            }
        }
        res.end(JSON.stringify(contentResponse));
    } catch (error) {
        res.status(400).send(JSON.stringify(error));
    }
});

app.post('/security/suggest', async function (req, res, next) {
    try {
        console.log(req.body.input)
        res.setHeader('Content-Type', 'application/json');
        let data = await autocompleteService.securityRequirementsSuggest(req);
        res.end(JSON.stringify(data));
    } catch (error) {
        res.status(400).send(JSON.stringify(error));
    }
});

app.post('/security/suggest/functional', async function (req, res, next) {
    try {
        console.log(req.body.input)
        res.setHeader('Content-Type', 'application/json');
        let data = await autocompleteService.functionalRequirementsSuggest(req);
        res.end(JSON.stringify(data));
    } catch (error) {
        res.status(400).send(JSON.stringify(error));
    }
});

app.post('/domain/suggest', async function (req, res, next) {
    try {
        console.log(req.body.input)
        res.setHeader('Content-Type', 'application/json');
        let data = await autocompleteService.domainRequirementsSuggest(req);
        res.end(JSON.stringify(data));
    } catch (error) {
        res.status(400).send(JSON.stringify(error));
    }
});

app.post('/domain/suggest/functional', async function (req, res, next) {
    try {
        console.log(req.body.input)
        res.setHeader('Content-Type', 'application/json');
        let data = await autocompleteService.domainFunctionalRequirementsSuggest(req);
        res.end(JSON.stringify(data));
    } catch (error) {
        res.status(400).send(JSON.stringify(error));
    }
});

app.post('/additionalRequirements', async function (req, res, next) {
    try {
        console.log(req.body.input)
        res.setHeader('Content-Type', 'application/json');
        let data = await additionalRequirements.additionalRequirementsSuggest(req);
        console.log(data);
        res.end(JSON.stringify(data));
    } catch (error) {
        res.status(400).send(JSON.stringify(error));
    }
});

app.post('/relatedRequirements', async function (req, res, next) {
    try {
        console.log(req.body.data)
        res.setHeader('Content-Type', 'application/json');
        let project = await relatedRequirementsService.suggest(req);
        console.log(project);
        let contentResponse = {
            transactionId: "1",
            message: "Completed.",
            data: {
                content: project
            }
        }
        res.end(JSON.stringify(contentResponse));
    } catch (error) {
        res.status(400).send(JSON.stringify(error));
    }
});

app.post('/relatedApplicationRequirements', async function (req, res, next) {
    try {
        console.log(req.body.data)
        res.setHeader('Content-Type', 'application/json');
        let project = await relatedRequirementsApplicationService.suggest(req);
        console.log(project);
        let contentResponse = {
            transactionId: "1",
            message: "Completed.",
            data: {
                content: project
            }
        }
        res.end(JSON.stringify(contentResponse));
    } catch (error) {
        res.status(400).send(JSON.stringify(error));
    }
});

app.post('/generate', async function (req, res, next) {
   /*  try {
        console.log('generate')
        console.log(req.body.data)
        res.setHeader('Content-Disposition', 'attachment; filename=SRS-'+req.body.data.project.name+'.docx');
        res.setHeader('Content-Type','application/vnd.openxmlformats-officedocument.wordprocessingml.documents; charset=UTF-8')
        let project = await generate.generate(req);
        console.log(project);
        res.send(Buffer.from(project, 'base64'));
    } catch (error) {
        console.log(error)
        res.status(400).send(JSON.stringify(error));
    } */
    try { 
        res.setHeader('Content-Type', 'application/json');
        let project = await generate.generate(req);
        let content_encode = project;
		let dataResponse ={
				"name": 'SRS-'+req.body.data.project.name+'.docx',
				"content": content_encode,
			  };
			  
		let data={
		  "transactionId": 'asdf',
		  "message": 'Success',
		  "data": dataResponse
		}  
        res.end(JSON.stringify(data));
    } catch (error) {
        res.status(400).send(JSON.stringify(error));
    }

});
/* app.post('/generate/SRS', async function (req, res, next) {
    try {
        console.log('generate')
        console.log(req.body.data)
        res.setHeader('Content-Disposition', 'attachment; filename=SRS.docx');
        res.setHeader('Content-Type','application/vnd.openxmlformats-officedocument.wordprocessingml.documents; charset=UTF-8')
        let project = await generate.generateSRS(req);
        console.log(project);
        res.send(Buffer.from(project, 'base64'));
    } catch (error) {
        console.log(error)
        res.status(400).send(JSON.stringify(error));
    }
}); */



app.post('/generateMapModelFromDomainRequirements', async function (req, res, next) {
    try {
        console.log(req.body.data)
        res.setHeader('Content-Type', 'application/json');
        let project = await mapModelService.generateMapModel(req);
        console.log(project);
        let contentResponse = {
            transactionId: "1",
            message: "Completed.",
            data: {
                content: project
            }
        }
        res.end(JSON.stringify(contentResponse));
    } catch (error) {
        res.status(400).send(JSON.stringify(error));
    }
});

app.post('/generateJSONFromGraphModel', async function (req, res, next) {
    try { 
        let json  = await graphModelService.generateJSON(req);
        const buffer = Buffer.from(json, 'utf-8'); 
        const content_encode = buffer.toString('base64'); 
		let dataResponse ={
				"name": ''+req.body.data.project.name+'.json',
				"content": content_encode,
			  }; 
		let data={
		  "transactionId": 'asdf',
		  "message": 'Success',
		  "data": dataResponse
		}  
        res.setHeader('Content-Type', 'application/json');
        res.end(JSON.stringify(data)); 
    } catch (error) {
        res.status(400).send(JSON.stringify(error));
    }
});

app.post('/generateApplicationFromFeatureModel', async function (req, res, next) {
    try {
        console.log(req.body.data)
        res.setHeader('Content-Type', 'application/json');
        let project = await applicationGenerationService.generateApplicationFromFeatureModel(req);
        console.log(project);
        let contentResponse = {
            transactionId: "1",
            message: "Completed.",
            data: {
                content: project
            }
        }
        res.end(JSON.stringify(contentResponse));
    } catch (error) {
        res.status(400).send(JSON.stringify(error));
    }
});

app.post('/generateApplicationFromFeatureModelWithoutAttributes', async function (req, res, next) {
    try {
        console.log(req.body.data)
        res.setHeader('Content-Type', 'application/json');
        let project = await applicationGenerationService.generateApplicationFromFeatureModelWithoutAttributes(req);
        console.log(project);
        let contentResponse = {
            transactionId: "1",
            message: "Completed.",
            data: {
                content: project
            }
        }
        res.end(JSON.stringify(contentResponse));
    } catch (error) {
        res.status(400).send(JSON.stringify(error));
    }
});

app.post('/generateFeatureComponentBindingModelFromFeatureModel', async function (req, res, next) {
    try {
        console.log(req.body.data)
        res.setHeader('Content-Type', 'application/json');
        let project = await featureComponentBindingModelService.generateFeatureComponentBindingModelFromFeatureModel(req);
        console.log(project);
        let contentResponse = {
            transactionId: "1",
            message: "Completed.",
            data: {
                content: project
            }
        }
        res.end(JSON.stringify(contentResponse));
    } catch (error) {
        res.status(400).send(JSON.stringify(error));
    }
});

app.post('/generateApplicationCode', async function (req, res, next) {
    try {
        console.log(req.body.data)
        let project = req.body.data.project;
        res.setHeader('Content-Type', 'application/json');
        let result = await applicationCodeGenerationService.generateApplicationCode(req);
        let contentResponse = {
            transactionId: "1",
            message: "Completed.",
            data: {
                content: project
            }
        }
        res.end(JSON.stringify(contentResponse));
    } catch (error) {
        res.status(400).send(JSON.stringify(error));
    }
});

app.listen(config.PORT, () => {
    console.log('Running version ' + config.VERSION + ` on http://${config.HOST}:${config.PORT}`);
});


// app.listen(PORT, HOST, () => {
//     console.log(`Running on http://${HOST}:${PORT}`);
// });

function uint8ArrayToBase64(uint8Array) {
    // Convertir Uint8Array a una cadena
    let binaryString = String.fromCharCode.apply(null, uint8Array);

    // Convertir la cadena a Base64
    return btoa(binaryString);
}