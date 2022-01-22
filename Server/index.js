const express = require("express");
const multer = require("multer");
const app = express();
const port = 5000;

/* upload file with multer */

app.use(cors());
app.use(express.static("./import"));

var storage = multer.diskStorage({
  destination: "./import",
  filename: function (req, file, cb) {
    cb(null, Date.now() + "-" + file.originalname);
  }
});

var upload = multer({ storage: storage }).array("file");

app.post("/upload", function (req, res) {
  upload(req, res, function (err) {
    if (err instanceof multer.MulterError) {
      return res.status(500).json(err);
    } else if (err) {
      return res.status(500).json(err);
    }
    return res.status(200).send(req.file);
  });
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log("server started at port " + PORT);
});






/* Initial hello world backend */

// app.get("/", (req, res) => {
//   res.send("Hello World!");
// });

// app.get("/getWeather", (req, res) => {
//   request("url", function (error, response, body) {
//     if (!error && response.statusCode == 200) {
//       var parseBody = JSON.parse(body);
//       var temp_c = parseBody["current"]["temp_c"];
//       res.send({ temp_c });
//     }
//   });
// });

// app.listen(port, () => {
//   console.log(`Example app listening at http://localhost:${port}`);
// });
