var fs = require("fs");
var parser = require("xml2json");
var glob = require("glob");
var path = require("path");

var input_dir = "./input_folder/";
var output_dir = "./output_folder/";

fs.readFile("./set.xml", function (err, data) {
  var json = parser.toJson(data, { object: true });
  var cards = json.set.cards.card;
  cards.forEach((card) => {
    glob(input_dir + card.id + ".jpg", function (er, files) {
      if (files.length > 0) {
        var foundFile = files[0];
        var cardNumber = card.property.find(
          (element) => element.name === "CardNumber"
        );

        if (cardNumber !== undefined) {
          var cardCode = cardNumber.value;
          var fileParsed = path.parse(foundFile);
          var newFileName = output_dir + cardCode + fileParsed.ext;
          fs.rename(foundFile, newFileName, function (err) {
            if (err) throw err;
            console.log(
              foundFile + " -> " + newFileName + " : Successfully renamed"
            );
          });
        }
      }
    });

    // Add alternate
    if (card.alternate) {
      glob(
        input_dir + card.id + "." + card.alternate.type + ".jpg",
        function (er, files) {
          if (files.length > 0) {
            var foundFile = files[0];
            cardNumber = card.alternate.property.find(
              (element) => element.name === "CardNumber"
            );
            if (cardNumber !== undefined) {
              var cardCode = cardNumber.value;
              var fileParsed = path.parse(foundFile);
              var newFileName = output_dir + cardCode + fileParsed.ext;
              fs.rename(foundFile, newFileName, function (err) {
                if (err) throw err;
                console.log("Alternate");
                console.log(
                  foundFile + " -> " + newFileName + " : Successfully renamed"
                );
              });
            }
          }
        }
      );
    }
  });
});
