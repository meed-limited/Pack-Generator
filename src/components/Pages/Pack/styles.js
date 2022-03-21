/*eslint no-dupe-keys: "Off"*/
import buttonImg from "../../../assets/buttonImg.svg";

const GREY = "#CCC";
const GREY_LIGHT = "rgba(255, 255, 255, 0.4)";
const GREY_DIM = "#686868";

const styles = {
  transparentInput: {
    width: "90%",
    margin: "auto",
    background: "rgba(240, 248, 255, 0.10)",
    background:
      "-moz-linear-gradient(left, rgba(240, 248, 255, 0.40) 0%, rgba(240, 248, 255, 0.25) 50%, rgba(240, 248, 255, 0.10) 100%)",
    background:
      "-webkit-linear-gradient(left, rgba(240, 248, 255, 0.40) 0%, rgba(240, 248, 255, 0.25) 50%, rgba(240, 248, 255, 0.10) 100%)",
    background:
      "linear-gradient(to right, rgba(240, 248, 255, 0.40) 0%, rgba(240, 248, 255, 0.25) 50%, rgba(240, 248, 255, 0.10) 100%)",
    border: "none",
    color: "white",
    textAlign: "center"
  },
  transparentInputSmaller: {
    width: "80%",
    margin: "auto",
    background: "rgba(240, 248, 255, 0.10)",
    background:
      "-moz-linear-gradient(left, rgba(240, 248, 255, 0.40) 0%, rgba(240, 248, 255, 0.25) 50%, rgba(240, 248, 255, 0.10) 100%)",
    background:
      "-webkit-linear-gradient(left, rgba(240, 248, 255, 0.40) 0%, rgba(240, 248, 255, 0.25) 50%, rgba(240, 248, 255, 0.10) 100%)",
    background:
      "linear-gradient(to right, rgba(240, 248, 255, 0.40) 0%, rgba(240, 248, 255, 0.25) 50%, rgba(240, 248, 255, 0.10) 100%)",
    border: "none",
    color: "white",
    textAlign: "center"
  },
  selectButton: {
    width: "55%",
    margin: "30px auto 30px 35px",
    backgroundImage: `url(${buttonImg})`,
    backgroundSize: "cover",
    border: "1px solid yellow",
    textAlign: "center",
    fontSize: "12px"
  },
  resetButton: {
    margin: "10px 30px",
    padding: "0 30px",
    background: "#d020ba",
    background: "-moz-linear-gradient(left, #d020ba 0%, #BF28C3 10%, #6563E0 100%)",
    background: "-webkit-linear-gradient(left, #d020ba 0%, #BF28C3 10%, #6563E0 100%)",
    background: "linear-gradient(to right, #d020ba 0%, #BF28C3 10%, #6563E0 100%)",
    border: "0.5px solid white",
    color: "yellow",
    fontSize: "12px"
  },
  runFunctionButton: {
    width: "300px",
    height: "50px",
    margin: "15px",
    padding: "8px",
    background: "#d020ba",
    background: "-moz-linear-gradient(left, #d020ba 0%, #BF28C3 10%, #6563E0 100%)",
    background: "-webkit-linear-gradient(left, #d020ba 0%, #BF28C3 10%, #6563E0 100%)",
    background: "linear-gradient(to right, #d020ba 0%, #BF28C3 10%, #6563E0 100%)",
    border: "0.5px solid white",
    borderRadius: "25px",
    color: "yellow",
    fontSize: "16px",
    fontWeight: "600",
    letterSpacing: "2px"
  },
  mainPackContainer: {
    display: "flex",
    flexDirection: "column",
    maxWidth: "100%",
    height: "65vh",
    alignItems: "center",
    justifyContent: "center",
    margin: "auto",
    borderRadius: "20px",
    background: "rgba(240, 248, 255, 0.10)",
    background:
      "-moz-linear-gradient(left, rgba(240, 248, 255, 0.40) 0%, rgba(240, 248, 255, 0.25) 50%, rgba(240, 248, 255, 0.10) 100%)",
    background:
      "-webkit-linear-gradient(left, rgba(240, 248, 255, 0.40) 0%, rgba(240, 248, 255, 0.25) 50%, rgba(240, 248, 255, 0.10) 100%)",
    background:
      "linear-gradient(to right, rgba(240, 248, 255, 0.40) 0%, rgba(240, 248, 255, 0.25) 50%, rgba(240, 248, 255, 0.10) 100%)",
    border: "1px solid",
    color: "white",
    fontSize: "18px",
    textAlign: "center"
  },
  transparentContainerNotconnected: {
    marginTop: "80px",
    padding: "15px",
    background: "rgba(240, 248, 255, 0.10)",
    background:
      "-moz-linear-gradient(left, rgba(240, 248, 255, 0.40) 0%, rgba(240, 248, 255, 0.25) 50%, rgba(240, 248, 255, 0.10) 100%)",
    background:
      "-webkit-linear-gradient(left, rgba(240, 248, 255, 0.40) 0%, rgba(240, 248, 255, 0.25) 50%, rgba(240, 248, 255, 0.10) 100%)",
    background:
      "linear-gradient(to right, rgba(240, 248, 255, 0.40) 0%, rgba(240, 248, 255, 0.25) 50%, rgba(240, 248, 255, 0.10) 100%)",
    border: "1px solid",
    borderRadius: "20px",
    color: "white",
    fontSize: "18px",
    textAlign: "left"
  },
  transparentContainerInside: {
    margin: "auto 30px",
    padding: "20px 0px",
    background: "rgba(240, 248, 255, 0.10)",
    background:
      "-moz-linear-gradient(left, rgba(240, 248, 255, 0.40) 0%, rgba(240, 248, 255, 0.25) 50%, rgba(240, 248, 255, 0.10) 100%)",
    background:
      "-webkit-linear-gradient(left, rgba(240, 248, 255, 0.40) 0%, rgba(240, 248, 255, 0.25) 50%, rgba(240, 248, 255, 0.10) 100%)",
    background:
      "linear-gradient(to right, rgba(240, 248, 255, 0.40) 0%, rgba(240, 248, 255, 0.25) 50%, rgba(240, 248, 255, 0.10) 100%)",
    border: "1px solid",
    borderRadius: "15px",
    textAlign: "center"
  },

  // Minter tab
  input: {
    display: "block",
    width: "60%",
    margin: "auto",
    marginBottom: "30px",
    border: "1px solid #ddd",
    boxSizing: "border-box"
  },
  input2: {
    display: "block",
    width: "60%",
    margin: "auto",
    marginBottom: "10px",
    border: "1px solid #ddd",
    boxSizing: "border-box"
  },
  textarea: {
    display: "block",
    width: "60%",
    margin: "auto",
    marginBottom: "30px"
  },
  select: {
    display: "block",
    width: "100%",
    padding: "6px 10px",
    margin: "10px 0",
    border: "1px solid #ddd",
    boxSizing: "border-box"
  },

  // Pack tab
  uploadBox: {
    display: "flex-grid",
    margin: "20px",
    padding: "15px",
    background: "rgba(240, 248, 255, 0.10)",
    background:
      "-moz-linear-gradient(left, rgba(240, 248, 255, 0.40) 0%, rgba(240, 248, 255, 0.25) 50%, rgba(240, 248, 255, 0.10) 100%)",
    background:
      "-webkit-linear-gradient(left, rgba(240, 248, 255, 0.40) 0%, rgba(240, 248, 255, 0.25) 50%, rgba(240, 248, 255, 0.10) 100%)",
    background:
      "linear-gradient(to right, rgba(240, 248, 255, 0.40) 0%, rgba(240, 248, 255, 0.25) 50%, rgba(240, 248, 255, 0.10) 100%)",
    borderRadius: "8px",
    color: "white",
    fontSize: "12px",
    opacity: "0.9"
  },
  zone: {
    display: "flex",
    flexDirection: "column",
    height: "100%",
    marginTop: "10px",
    marginBottom: "15px",
    padding: 20,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "white",
    borderColor: "#6d3ef7",
    borderWidth: 2,
    borderStyle: "dashed",
    borderRadius: 20,
    color: "black"
  },
  file: {
    background: "linear-gradient(to bottom, rgb(243 213 232), rgb(22 0 110))",
    borderRadius: 20,
    display: "flex",
    height: "auto",
    width: "80%",
    position: "relative",
    zIndex: 10,
    flexDirection: "column",
    justifyContent: "center"
  },
  info: {
    alignItems: "center",
    display: "flex",
    flexDirection: "column",
    padding: "10px"
  },
  size: {
    backgroundColor: GREY_LIGHT,
    borderRadius: 3,
    marginBottom: "0.5em",
    justifyContent: "center",
    display: "flex"
  },
  name: {
    backgroundColor: GREY_LIGHT,
    borderRadius: 3,
    fontSize: 15,
    marginBottom: "0.5em"
  },
  progressBar: {
    bottom: 14,
    position: "absolute",
    width: "100%",
    paddingLeft: 10,
    paddingRight: 10
  },
  zoneHover: {
    borderColor: GREY_DIM
  },
  default: {
    borderColor: GREY
  },
  remove: {
    height: 23,
    position: "absolute",
    right: 6,
    top: 6,
    width: 23
  },
  contentGrid: {
    marginBottom: "30px",
    margin: "auto",
    display: "grid",
    gridTemplateColumns: "49% 2% 49%",
    fontSize: "12px"
  },

  // MARKETPLACE:
  table: {
    margin: "0 auto",
    width: "100%",
    padding: "10px 20px 10px 20px",
    borderRadius: "10px",
    background: "rgba(240, 248, 255, 0.10)",
    background:
      "-moz-linear-gradient(left, rgba(240, 248, 255, 0.40) 0%, rgba(240, 248, 255, 0.25) 50%, rgba(240, 248, 255, 0.10) 100%)",
    background:
      "-webkit-linear-gradient(left, rgba(240, 248, 255, 0.40) 0%, rgba(240, 248, 255, 0.25) 50%, rgba(240, 248, 255, 0.10) 100%)",
    background:
      "linear-gradient(to right, rgba(240, 248, 255, 0.40) 0%, rgba(240, 248, 255, 0.25) 50%, rgba(240, 248, 255, 0.10) 100%)",
    border: "1px solid",
    textAlign: "center",
    color: "white"
  }
};

export default styles;
