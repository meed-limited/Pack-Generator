export const networkCollections = {
  "0x13881": [
    //Add Your MUMBAI Collections here
    {
      image:
        "https://ipfs.moralis.io:2053/ipfs/QmfLbpeVHxReWKNLaXTPcWiafi49eoAL4gRwMGuXtx2Eqe/images/14.png",
      name: "Pixel Show",
      addrs: "0xCA34404dD8Bd6537BE76F3A51B379F8949bD7973",
    },
    {
      image:
        "https://lh3.googleusercontent.com/hFCb17umU30lOhDJJj2XiPQgD60pMKpvD-qiflRNiQwpCkzckDXYPYDSdRj8v3ImaejCqUVkCxAbZTqafRy2C9w-qaXYdC8fwFVbRQ=w600",
      name: "Art Abstrait",
      addrs: "0x2953399124F0cBB46d2CbACD8A89cF0599974963",
    }
  ],

  "0x89": [
    //Add Your POLYGON Collections here
    {
      image:
        "https://lh3.googleusercontent.com/drFQztyvWfO6XYt-kpuY1I2oDD3LmJ4E8D2nE6yc0gkbM3XrGP_wXd-LlljXhTAWDczM4sd9nrBRbhLynw1vblIL8HleX_U-VwyewQ=w600",
      name: "Chilli Bottles",
      addrs: "0xE3ECE750517f51aE262B4df02e0950E4c2b4d830",
    },
    
  ],

  "0x1": [
    {
      image:
        "https://lh3.googleusercontent.com/drFQztyvWfO6XYt-kpuY1I2oDD3LmJ4E8D2nE6yc0gkbM3XrGP_wXd-LlljXhTAWDczM4sd9nrBRbhLynw1vblIL8HleX_U-VwyewQ=w600",
      name: "Chilli Bottles",
      addrs: "0xE3ECE750517f51aE262B4df02e0950E4c2b4d830",
    },
    {
      image:
        "https://lh3.googleusercontent.com/Ju9CkWtV-1Okvf45wo8UctR-M9He2PjILP0oOvxE89AyiPPGtrR3gysu1Zgy0hjd2xKIgjJJtWIc0ybj4Vd7wv8t3pxDGHoJBzDB=s130",
      name: "Bored Ape Yacht Club",
      addrs: "0xBC4CA0EdA7647A8aB7C2061c2E118A18a936f13D",
    },
    {
      image:
        "https://lh3.googleusercontent.com/BdxvLseXcfl57BiuQcQYdJ64v-aI8din7WPk0Pgo3qQFhAUH-B6i-dCqqc_mCkRIzULmwzwecnohLhrcH8A9mpWIZqA7ygc52Sr81hE=s130",
      name: "Crypto Punks",
      addrs: "0xb47e3cd837dDF8e4c57F05d70Ab865de6e193BBB",
    },
    {
      image:
        "https://lh3.googleusercontent.com/l1wZXP2hHFUQ3turU5VQ9PpgVVasyQ79-ChvCgjoU5xKkBA50OGoJqKZeMOR-qLrzqwIfd1HpYmiv23JWm0EZ14owiPYaufqzmj1=s0",
      name: "Bored Ape Kennel Club",
      addrs: "0xba30E5F9Bb24caa003E9f2f0497Ad287FDF95623",
    }
  ],
};

export const getCollectionsByChain = (chain) => networkCollections[chain];


// Exemple:
// "0x13881": [
//   //Add MUMBAI Collections here
//   {
//     image:
//       "https://lh3.googleusercontent.com/BWCni9INm--eqCK800BbRkL10zGyflxfPwTHt4XphMSWG3XZvPx1JyGdfU9vSor8K046DJg-Q8Y4ioUlWHiCZqgR_L00w4vcbA-w=s0",
//     name: "Test Mages",
//     addrs: "0x275d553f426355c20b134D944B5b28D31CDb83DA",
//   }
// ],

// "0x89": [
//   //Add POLYGON Collections here
//   {
//     image:
//       "https://lh3.googleusercontent.com/drFQztyvWfO6XYt-kpuY1I2oDD3LmJ4E8D2nE6yc0gkbM3XrGP_wXd-LlljXhTAWDczM4sd9nrBRbhLynw1vblIL8HleX_U-VwyewQ=w600",
//     name: "Chilli Bottles",
//     addrs: "0xE3ECE750517f51aE262B4df02e0950E4c2b4d830",
//   },
  
// ],

// "0x1": [
//   //Add ETH Collections here
//   {
//     image:
//       "https://lh3.googleusercontent.com/drFQztyvWfO6XYt-kpuY1I2oDD3LmJ4E8D2nE6yc0gkbM3XrGP_wXd-LlljXhTAWDczM4sd9nrBRbhLynw1vblIL8HleX_U-VwyewQ=w600",
//     name: "Chilli Bottles",
//     addrs: "0xE3ECE750517f51aE262B4df02e0950E4c2b4d830",
//   }
// ]