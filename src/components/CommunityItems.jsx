import LepriconLogoWhite from "../assets/LepriconLogoWhite.png";
import discord from "../assets/discord.png";
import telegram from "../assets/telegram.png";
import { FacebookOutlined, GithubOutlined, LinkedinOutlined, TwitterOutlined } from "@ant-design/icons";
import Text from "antd/lib/typography/Text";

const Community = () => {
  return (
    <>
      <Text style={{ display: "flex", color: "white", float: "left" }}>
        Powered by |
        <a href='https://lepricon.io/' target='_blank' rel='noopener noreferrer'>
          <div style={{ width: "90px", paddingLeft: "10px" }}>
            <img src={LepriconLogoWhite} alt='LepriconLogoWhite' />
          </div>
        </a>
      </Text>
      <Text style={{ display: "flex", color: "white", float: "right" }}>
        <a href='https://twitter.com/lepriconio' target='_blank' rel='noopener noreferrer'>
          <div style={{ padding: "0 10px 0 15px" }}>
            <TwitterOutlined style={{ color: "white" }} />
          </div>
        </a>
        <a href='http://discord.gg/lepricon' target='_blank' rel='noopener noreferrer'>
          <div style={{ padding: "4px 10px 0 10px" }}>
            <img src={discord} alt='discord' />
          </div>
        </a>
        <a href='https://t.me/lepriconio' target='_blank' rel='noopener noreferrer'>
          <div style={{ padding: "4px 10px 0 10px" }}>
            <img src={telegram} alt='telegram' />
          </div>
        </a>
        <a href='https://www.facebook.com/lepriconio' target='_blank' rel='noopener noreferrer'>
          <div style={{ padding: "0 10px" }}>
            <FacebookOutlined style={{ color: "white" }} />
          </div>
        </a>
        <a href='https://sc.linkedin.com/company/lepricon-io' target='_blank' rel='noopener noreferrer'>
          <div style={{ padding: "0 10px" }}>
            <LinkedinOutlined style={{ color: "white" }} />
          </div>
        </a>
        <a href='https://github.com/shamrockstudios/NFT-Bundle-WebApp' target='_blank' rel='noopener noreferrer'>
              <div style={{ padding: "0 10px" }}>
                <GithubOutlined style={{ color: "white" }} />
              </div>
            </a>
      </Text>
    </>
  );
};

export default Community;
