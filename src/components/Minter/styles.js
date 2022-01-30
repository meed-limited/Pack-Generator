import buttonImg from "../../assets/buttonImg.svg";
/*eslint no-dupe-keys: "Off"*/

const styles = {
  content: {
    width: "75vw",
    height: "80vh",
    margin: "auto",
    marginTop: "30px",
    textAlign: "center"
  },
  label: {
    textAlign: "center",
    display: "block",
    color: "white",
    fontSize: "15px"
  },
  transparentInput: {
    textAlign: "center",
    width: "90%",
    margin: "auto",
    color: "white",
    border: "none", // border or no border ???
    background: "rgba(240, 248, 255, 0.10)",
    background:
      "-moz-linear-gradient(left, rgba(240, 248, 255, 0.40) 0%, rgba(240, 248, 255, 0.25) 50%, rgba(240, 248, 255, 0.10) 100%)",
    background:
      "-webkit-linear-gradient(left, rgba(240, 248, 255, 0.40) 0%, rgba(240, 248, 255, 0.25) 50%, rgba(240, 248, 255, 0.10) 100%)",
    background:
      "linear-gradient(to right, rgba(240, 248, 255, 0.40) 0%, rgba(240, 248, 255, 0.25) 50%, rgba(240, 248, 255, 0.10) 100%)"
  },
  selectButton: {
    width: "55%",
    margin: "30px auto 30px auto",
    backgroundImage: `url(${buttonImg})`,
    backgroundSize: "cover",
    border: "1px solid yellow",
  },
  // selectButton2: {
  //   width: "70%",
  //   margin: "30px",
  //   height: "45px",
  //   borderImage: "linear-gradient(to right, #FFC400 0%, #C59237 50%, #7835A4 100%) 1",
  //   background: "transparent",
  //   backgroundSize: "100% 100%",
  //   borderStyle: "solid",
  //   borderWidth: "3px"
  // },
  resetButton: {
    paddingLeft: "30px",
    paddingRight: "30px",
    background: "#d020ba",
    background: "-moz-linear-gradient(left, #d020ba 0%, #BF28C3 10%, #6563E0 100%)",
    background: "-webkit-linear-gradient(left, #d020ba 0%, #BF28C3 10%, #6563E0 100%)",
    background: "linear-gradient(to right, #d020ba 0%, #BF28C3 10%, #6563E0 100%)",
    color: "yellow",
    border: "0.5px solid white",
    fontSize: "15px",
    cursor: "pointer"
  },
  runFunctionButton: {
    margin: "20px",
    width: "300px",
    height: "50px",
    background: "#d020ba",
    background: "-moz-linear-gradient(left, #d020ba 0%, #BF28C3 10%, #6563E0 100%)",
    background: "-webkit-linear-gradient(left, #d020ba 0%, #BF28C3 10%, #6563E0 100%)",
    background: "linear-gradient(to right, #d020ba 0%, #BF28C3 10%, #6563E0 100%)",
    color: "yellow",
    border: "0.5px solid white",
    padding: "8px",
    fontSize: "20px",
    cursor: "pointer",
    borderRadius: "25px",
    fontWeight: "600",
    letterSpacing: "2px",
  },
  transparentContainer: {
    borderRadius: "20px",
    background: "rgba(240, 248, 255, 0.10)",
    background:
      "-moz-linear-gradient(left, rgba(240, 248, 255, 0.40) 0%, rgba(240, 248, 255, 0.25) 50%, rgba(240, 248, 255, 0.10) 100%)",
    background:
      "-webkit-linear-gradient(left, rgba(240, 248, 255, 0.40) 0%, rgba(240, 248, 255, 0.25) 50%, rgba(240, 248, 255, 0.10) 100%)",
    background:
      "linear-gradient(to right, rgba(240, 248, 255, 0.40) 0%, rgba(240, 248, 255, 0.25) 50%, rgba(240, 248, 255, 0.10) 100%)",
    border: "1px solid",
    textAlign: "center",
    paddingTop: "50px",
    paddingBottom: "50px",
    fontSize: "25px",
    color: "white"
  },
  transparentContainerInside: {
    borderRadius: "15px",
    margin: "30px",
    background: "rgba(240, 248, 255, 0.10)",
    background:
      "-moz-linear-gradient(left, rgba(240, 248, 255, 0.40) 0%, rgba(240, 248, 255, 0.25) 50%, rgba(240, 248, 255, 0.10) 100%)",
    background:
      "-webkit-linear-gradient(left, rgba(240, 248, 255, 0.40) 0%, rgba(240, 248, 255, 0.25) 50%, rgba(240, 248, 255, 0.10) 100%)",
    background:
      "linear-gradient(to right, rgba(240, 248, 255, 0.40) 0%, rgba(240, 248, 255, 0.25) 50%, rgba(240, 248, 255, 0.10) 100%)",
    border: "1px solid",
    textAlign: "center",
    paddingBottom: "50px",
    fontSize: "25px",
    color: "white"
  },
  displayAssets: {
    alignSelf: "center",
    maxWidth: "50%",
    marginTop: "8px",
    margin: "auto",
    borderRadius: "8px",
    backgroundColor: "white",
    color: "black",
    opacity: "0.8"
  },

  // TABS:
  tabs: {
    height: "60px",
    color: "white",
    borderBottom: "none"
  },

  // Minter tab
  input: {
    width: "60%",
    margin: "auto",
    marginBottom: "30px",
    border: "1px solid #ddd",
    boxSizing: "border-box",
    display: "block"
  },
  input2: {
    width: "60%",
    margin: "auto",
    marginBottom: "10px",
    border: "1px solid #ddd",
    boxSizing: "border-box",
    display: "block"
  },
  textarea: {
    width: "60%",
    margin: "auto",
    marginBottom: "30px",
    display: "block"
  },
  select: {
    width: "100%",
    padding: "6px 10px",
    margin: "10px 0",
    border: "1px solid #ddd",
    boxSizing: "border-box",
    display: "block"
  },

  // Batch Bundle tab
  uploadBox: {
    display: "flex-grid",
    marginTop: "40px",
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
    opacity: "0.9",
    marginBottom: "20px",
    color: "white",
    fontSize: "15px"
  },
  contentGrid: {
    marginBottom: "30px",
    margin: "auto",
    display: "grid",
    gridTemplateColumns: "49% 2% 49%",
    fontSize: "15px"
  },

  // Claim tab
  displaySelected: {
    margin: "auto",
    marginTop: "50px",
    borderRadius: "8px",
    backgroundColor: "white",
    color: "black",
    opacity: "0.8",
    fontSize: "16px",
    width: "40%"
  },

  // MarketPlace:
  table: {
    margin: "0 auto",
    width: "1000px"
  }
};

export default styles;
