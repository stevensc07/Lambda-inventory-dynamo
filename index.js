"use strict";
require("dotenv").config();
const dynamoDb = require("./services/dynamo.service");
const ajvO = require("ajv");
const ajvRq = new ajvO();
const schemaCreateInventoryRq = require("./schemas/rqCreateInventorySchema.json");
const schemaGetInventoriesRq = require("./schemas/rqGetInventoriesSchema.json");
const schemaGetInventoryRq = require("./schemas/rqGetInventorySchema.json");

const validateGetOneRq = ajvRq.compile(schemaGetInventoryRq);
const validateGetRq = ajvRq.compile(schemaGetInventoriesRq);
const validateCreateRq = ajvRq.compile(schemaCreateInventoryRq);

module.exports.createInventony = async (event) => {
  const data = JSON.parse(event.body);
  let valid = validateCreateRq(data);

  if (!valid) {
    return {
      statusCode: 406,
      headers: {
        "Access-Control-Allow-Origin": "*",
        "Access-Control-Allow-Credentials": true,
      },
      body: JSON.stringify({
        message: "Empty fields are not accepted",
        details: validateCreateRq.errors[0],
      }),
    };
  }
  const { fullName, description, quantity, nit } = data;
  const creationDate = new Date().toDateString();
  const updateDate = creationDate;
  const PK = "#INVENTORIES";
  const SK = "#INVENTORY#" + nit + "#" + fullName;
  const payload = {
    PK,
    SK,
    fullName,
    description,
    quantity,
    creationDate,
    updateDate,
  };

  try {
    await dynamoDb.putItem(
      payload,
      process.env.TABLE_NAME + "-" + process.env.STAGE
    );
  } catch (error) {
    return {
      statusCode: 400,
      headers: {
        "Access-Control-Allow-Origin": "*",
        "Access-Control-Allow-Credentials": true,
      },
      error: JSON.stringify(error),
    };
  }
  return {
    statusCode: 200,
    headers: {
      "Access-Control-Allow-Origin": "*",
      "Access-Control-Allow-Credentials": true,
    },
    body: JSON.stringify({ message: "success", payload }),
  };
};

module.exports.getInventories = async (event) => {
  const data = JSON.parse(event.body);
  let valid = validateGetRq(data);

  if (!valid) {
    return {
      statusCode: 406,
      headers: {
        "Access-Control-Allow-Origin": "*",
        "Access-Control-Allow-Credentials": true,
      },
      body: JSON.stringify({
        message: "Empty fields are not accepted",
        details: validateGetRq.errors[0],
      }),
    };
  }
  const { nit } = data;

  let resultRequest = {};

  try {
    resultRequest = await dynamoDb.scan(
      nit,
      process.env.TABLE_NAME + "-" + process.env.STAGE
    );
  } catch (error) {
    console.log("Error get users: ", error);
    return {
      statusCode: 400,
      headers: {
        "Access-Control-Allow-Origin": "*",
        "Access-Control-Allow-Credentials": true,
      },
    };
  }
  return {
    statusCode: 200,
    headers: {
      "Access-Control-Allow-Origin": "*",
      "Access-Control-Allow-Credentials": true,
    },
    body: JSON.stringify(resultRequest),
  };
};

module.exports.getInventory = async (event) => {
  const data = JSON.parse(event.body);
  let valid = validateGetOneRq(data);
  if (!valid) {
    return {
      statusCode: 406,
      headers: {
        "Access-Control-Allow-Origin": "*",
        "Access-Control-Allow-Credentials": true,
      },
      body: JSON.stringify({
        message: "Empty fields are not accepted",
        details: validateGetRq.errors[0],
      }),
    };
  }

  const { nit, fullName } = data;
  let resultRequest;
  try {
    resultRequest = await dynamoDb.scanItem(
      { nit, fullName },
      process.env.TABLE_NAME + "-" + process.env.STAGE
    );
  } catch (error) {
    console.log("Error create: ", error);
    return {
      statusCode: 400,
      headers: {
        "Access-Control-Allow-Origin": "*",
        "Access-Control-Allow-Credentials": true,
      },
      error: JSON.stringify(error),
    };
  }
  return {
    statusCode: 200,
    headers: {
      "Access-Control-Allow-Origin": "*",
      "Access-Control-Allow-Credentials": true,
    },
    body: JSON.stringify(resultRequest),
  };
};

module.exports.deleteInventory = async (event) => {
  const data = JSON.parse(event.body);
  let valid = validateGetOneRq(data);
  if (!valid) {
    return {
      statusCode: 406,
      headers: {
        "Access-Control-Allow-Origin": "*",
        "Access-Control-Allow-Credentials": true,
      },
      body: JSON.stringify({
        message: "Empty fields are not accepted",
        details: validateGetRq.errors[0],
      }),
    };
  }

  const { nit, fullName } = data;
  let resultRequest;
  try {
    resultRequest = await dynamoDb.deleteItem(
      { PK: "#INVENTORIES", SK: "#INVENTORY#" + nit + "#" + fullName },
      process.env.TABLE_NAME + "-" + process.env.STAGE
    );
  } catch (error) {
    console.log("Error create: ", error);
    return {
      statusCode: 400,
      headers: {
        "Access-Control-Allow-Origin": "*",
        "Access-Control-Allow-Credentials": true,
      },
      error: JSON.stringify(error),
    };
  }
  return {
    statusCode: 200,
    headers: {
      "Access-Control-Allow-Origin": "*",
      "Access-Control-Allow-Credentials": true,
    },
    body: JSON.stringify(resultRequest),
  };
};
