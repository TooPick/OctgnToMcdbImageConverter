var fs = require("fs");
var parser = require("xml2json");
var glob = require("glob");
var path = require("path");
const commander = require("commander");
const packageJson = require("./package.json");
const winston = require("winston");

// Set up logger
const logs_dir = "./logs/";
const date = new Date();
const log_filename_prefix =
  date.getFullYear() +
  "-" +
  (date.getMonth() + 1) +
  "-" +
  date.getDate() +
  "-" +
  date.getHours() +
  "-" +
  date.getMinutes() +
  "-" +
  date.getSeconds() +
  "-";
// check if directory exist
if (!fs.existsSync(logs_dir)) {
  fs.mkdirSync(logs_dir); // create new directory
}
const logger = winston.createLogger({
  level: "info",
  format: winston.format.json(),
  transports: [
    new winston.transports.File({
      filename: logs_dir + log_filename_prefix + "error.log",
      level: "error",
    }),
    new winston.transports.File({
      filename: logs_dir + log_filename_prefix + "combined.log",
    }),
  ],
});

if (process.env.NODE_ENV !== "production") {
  logger.add(
    new winston.transports.Console({
      format: winston.format.simple(),
    })
  );
}

// Input/Output Folders
var default_input_dir = "./input_folder/";
var default_output_dir = "./output_folder/";
// Sets xml file
var default_setXml = "./set.xml";

// Init script arguments
commander
  .version(packageJson.version, "-v, --version")
  .usage("[OPTIONS]...")
  .option("-i, --input <value>", "images input dir", default_input_dir)
  .option("-o, --output <value>", "images output dir", default_output_dir)
  .option("-x, --xml <value>", "set.xml input file", default_setXml)
  .parse(process.argv);

const options = commander.opts();

function isEmpty(path) {
  return fs.readdirSync(path).length === 0;
}

var canStart = true;
// Check input folder
if (fs.existsSync(options.input)) {
  if (isEmpty(options.input)) {
    logger.error(options.input + ": exists but is empty");
    canStart = false;
  }
} else {
  logger.error(options.input + ": directory not found.");
  canStart = false;
}

// Check output folder
if (fs.existsSync(options.output)) {
  if (!isEmpty(options.output)) {
    logger.error(options.output + ": exists but is not empty");
    canStart = false;
  }
} else {
  logger.error(options.output + ": directory not found.");
  canStart = false;
}

// Check set xml file
if (!fs.existsSync(options.xml)) {
  logger.error(options.xml + ": file not found.");
  canStart = false;
}

if (canStart) {
  fs.readFile(options.xml, function (err, data) {
    var json = parser.toJson(data, { object: true });
    var cards = json.set.cards.card;
    cards.forEach((card) => {
      var inputFile = options.input + card.id + ".jpg";
      glob(inputFile, function (er, files) {
        if (files.length > 0) {
          var foundFile = files[0];
          var cardNumber = card.property.find(
            (element) => element.name === "CardNumber"
          );

          if (cardNumber !== undefined) {
            var cardCode = cardNumber.value;
            var fileParsed = path.parse(foundFile);
            var newFileName = options.output + cardCode + fileParsed.ext;
            fs.rename(foundFile, newFileName, function (err) {
              if (err) throw err;
              logger.info(
                foundFile + " -> " + newFileName + " : Successfully renamed"
              );
            });
          }
        } else {
          logger.error(
            "File not found for card : " + card.name + " (" + inputFile + ")"
          );
        }
      });

      // Add alternate
      if (card.alternate) {
        var inputFile =
          options.input + card.id + "." + card.alternate.type + ".jpg";
        glob(inputFile, function (er, files) {
          if (files.length > 0) {
            var foundFile = files[0];
            cardNumber = card.alternate.property.find(
              (element) => element.name === "CardNumber"
            );
            if (cardNumber !== undefined) {
              var cardCode = cardNumber.value;
              var fileParsed = path.parse(foundFile);
              var newFileName = options.output + cardCode + fileParsed.ext;
              fs.rename(foundFile, newFileName, function (err) {
                if (err) throw err;
                logger.info(
                  foundFile + " -> " + newFileName + " : Successfully renamed"
                );
              });
            }
          } else {
            logger.error(
              "File not found for card : " + card.name + " (" + inputFile + ")"
            );
          }
        });
      }
    });
  });
}
