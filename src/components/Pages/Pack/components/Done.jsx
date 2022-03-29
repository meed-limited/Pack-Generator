import { FileSearchOutlined } from "@ant-design/icons";

const styles = {
   
    title: {
      color: "white",
      fontWeight: 600,
      fontSize: "40px",
      marginBottom: "30px"
    },
    text: {
        color: "white",
      fontSize: "20px",
      margin: "20px auto"
    }
  };
  
  const Done = ({ packReceipt, isClaim }) => {
    return (
      <div style={styles.container}>
        <p style={styles.title}>Done !</p>
        <p style={styles.text}>
          Your assets have been succesfully {isClaim ? "un" : ""}packed !!!<br></br>
          <a href={packReceipt?.link} target='_blank' rel='noreferrer noopener'>
            View in explorer: &nbsp;
            <FileSearchOutlined style={{ transform: "scale(1.3)", color: "purple" }} />
          </a>
          <br></br>
        </p>
        <p style={styles.text}>Thank you for using Lepricon product.</p>
      </div>
    );
  };
  
  export default Done;
  