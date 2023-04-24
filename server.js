const dotenv = require("dotenv");
dotenv.config({ path: "./config.env" });
const express = require("express");
const fs = require("fs");
const cors = require("cors");
const bodyparser = require("body-parser");
const app = express();
var request = require("request");

const xml = require("x2js");
const storage = require("node-persist");
storage.init({
  dir: "./storage",
  stringify: JSON.stringify,
  parse: JSON.parse,
  encoding: "utf8",
  logging: false,
  continuous: true,
  ttl: false,
});
const nodemailer = require("nodemailer");

app.use(cors());

const pdf = require("html-pdf");
app.use(bodyparser.text({ type: "text/html" }));

app.use(bodyparser.json());

console.log("deployed");
app.get("/", (req, res) => {
  res.send("Hello, this is working");
});
app.use(function (req, res, next) {
  res.header("Access-Control-Allow-Origin", "*");
  res.header(
    "Access-Control-Allow-Headers",
    "Origin,X-Requested-With,Content-Type,Accept"
  );
  next();
});

process.env["NODE_TLS_REJECT_UNAUTHORIZED"] = 0;
var custid;
app.post("/customer", function (req, res) {
  var custpass;

  custid = req.body.custid;
  custpass = req.body.custpass;

  storage.setItem("auth", custid);

  var options = {
    method: "POST",
    url: "https://dxbktlds4.kaarcloud.com:4300/sap/bc/srt/rfc/sap/zes_login_15_01/100/zes_login_15_01/zes_login_15_01",
    headers: {
      "Content-Type": "application/soap+xml",
      SOAPAction:
        "urn:sap-com:document:sap:rfc:functions:ZES_LOGIN_15_01:ZSK_LOGINRequest",
      Authorization: "Basic QWJhcGVyOkFiYXBlckAxMjM=",
      Cookie: "sap-usercontext=sap-client=100",
    },
    body:
      '<soap:Envelope xmlns:soap="http://www.w3.org/2003/05/soap-envelope" xmlns:urn="urn:sap-com:document:sap:rfc:functions">\r\n   <soap:Header/>\r\n   <soap:Body>\r\n      <urn:ZSK_LOGIN>\r\n         <P_CUSTOMERID>' +
      custid +
      "</P_CUSTOMERID>\r\n         <P_PASSWORD>" +
      custpass +
      " </P_PASSWORD>\r\n      </urn:ZSK_LOGIN>\r\n   </soap:Body>\r\n</soap:Envelope>",
  };

  request(options, function (error, response) {
    if (error) throw new Error(error);
    var data = new xml();
    var xmljs = data.xml2js(response.body);
    xmljs = JSON.stringify(xmljs);
    res.send(xmljs);
  });

  console.log(custid);
});
app.get("/customer/logout", function (req, res) {
  (async () => {
    try {
    await  storage.removeItem("auth");
      console.log(storage.getItem("auth"), "logout");
      res.send("Logged out successfully");
    } catch (err) {
      console.error('Error retrieving data:', err);
    }
  })();
 
});
//DONE
app.post("/profile", function (req, res) {
  (async () => {
    try {
      var options = {
        method: "POST",
        url: "https://dxbktlds4.kaarcloud.com:4300/sap/bc/srt/rfc/sap/zes_sk_profile/100/zes_sk_profile/zes_sk_profile",
        headers: {
          "Content-Type": "application/soap+xml",
          SOAPAction:
            "urn:sap-com:document:sap:rfc:functions:ZSK_FM_PROFILE:ZSK_FM_PROFILEResponse",
          Authorization: "Basic QWJhcGVyOkFiYXBlckAxMjM=",
          Cookie: "sap-usercontext=sap-client=100",
        },
        body:
          '<soap:Envelope xmlns:soap="http://www.w3.org/2003/05/soap-envelope" xmlns:urn="urn:sap-com:document:sap:rfc:functions">\r\n   <soap:Header/>\r\n   <soap:Body>\r\n      <urn:ZSK_FM_PROFILE>\r\n         <!--Optional:-->\r\n         <IT_KNA1>\r\n            <!--Zero or more repetitions:-->\r\n            <item>\r\n             \r\n            </item>\r\n         </IT_KNA1>\r\n         <P_CUSTOMER_ID>' +
        await  storage.getItem("auth") +
          "</P_CUSTOMER_ID>\r\n      </urn:ZSK_FM_PROFILE>\r\n   </soap:Body>\r\n</soap:Envelope>",
      };
    
      request(options, function (error, response) {
        if (error) throw new Error(error);
        var data = new xml();
        var xmljs = data.xml2js(response.body);
        xmljs = JSON.stringify(xmljs);
        res.send(xmljs);
      });
    
      console.log(custid);
    } catch (err) {
      console.error('Error retrieving data:', err);
    }
  })();

});

//done
app.post("/invoice", function (req, res) {
  (async () => {
    try {
      var options = {
        method: "POST",
        url: "https://dxbktlds4.kaarcloud.com:4300/sap/bc/srt/rfc/sap/zes_sk_invoice/100/zes_sk_invoice/zes_sk_invoice",
        headers: {
          "Content-Type": "application/soap+xml",
          SOAPAction:
            "urn:sap-com:document:sap:rfc:functions:ZES_SK_INVOICE:ZSK_FM_INVOICEResponse",
          Authorization: "Basic QWJhcGVyOkFiYXBlckAxMjM=",
          Cookie: "sap-usercontext=sap-client=100",
        },
        body:
          '<soap:Envelope xmlns:soap="http://www.w3.org/2003/05/soap-envelope" xmlns:urn="urn:sap-com:document:sap:rfc:functions">\r\n   <soap:Header/>\r\n   <soap:Body>\r\n      <urn:ZSK_FM_INVOICE>\r\n         <IM_CUSID>' +
         await storage.getItem("auth") +
          "</IM_CUSID>\r\n         <!--Optional:-->\r\n         <IT_INVOICE_LIST>\r\n            <!--Zero or more repetitions:-->\r\n            <item>\r\n               \r\n            </item>\r\n         </IT_INVOICE_LIST>\r\n      </urn:ZSK_FM_INVOICE>\r\n   </soap:Body>\r\n</soap:Envelope>",
      };
      request(options, function (error, response) {
        if (error) throw new Error(error);
        var data = new xml();
        var xmljs = data.xml2js(response.body);
        xmljs = JSON.stringify(xmljs);
        res.send(xmljs);
      });
    
      console.log(storage.getItem("auth"));
    } catch (err) {
      console.error('Error retrieving data:', err);
    }
  })();
  
});

app.post("/inquiry", function (req, res) {
  (async () => {
    try {
      var options = {
        method: "POST",
        url: "https://dxbktlds4.kaarcloud.com:4300/sap/bc/srt/rfc/sap/zes_sk_inquiry/100/zes_sk_inquiry/zes_sk_inquiry",
        headers: {
          "Content-Type": "application/soap+xml",
          SOAPAction:
            "urn:sap-com:document:sap:rfc:functions:ZSK_FM_INQUIRY:ZSK_FM_INQUIRYResponse",
          Authorization: "Basic QWJhcGVyOkFiYXBlckAxMjM=",
          Cookie: "sap-usercontext=sap-client=100",
        },
        body:
          '<soap:Envelope xmlns:soap="http://www.w3.org/2003/05/soap-envelope" xmlns:urn="urn:sap-com:document:sap:rfc:functions">\r\n   <soap:Header/>\r\n   <soap:Body>\r\n      <urn:ZSK_FM_INQUIRY>\r\n         <!--Optional:-->\r\n         <IT_INQUIRY_LIST>\r\n            <!--Zero or more repetitions:-->\r\n            <item>\r\n              \r\n            </item>\r\n         </IT_INQUIRY_LIST>\r\n         <P_CUSTOMER_ID>' +
        await  storage.getItem("auth") +
          "</P_CUSTOMER_ID>\r\n      </urn:ZSK_FM_INQUIRY>\r\n   </soap:Body>\r\n</soap:Envelope>",
      };
      request(options, function (error, response) {
        if (error) throw new Error(error);
        var data = new xml();
        var xmljs = data.xml2js(response.body);
        xmljs = JSON.stringify(xmljs);
        res.send(xmljs);
      });
    
      console.log(custid);
    } catch (err) {
      console.error('Error retrieving data:', err);
    }
  })();

});
//DONE
app.post("/creditdebit", function (req, res) {
  (async () => {
    try {
      var options = {
        method: "POST",
        url: "https://dxbktlds4.kaarcloud.com:4300/sap/bc/srt/rfc/sap/zes_sk_credeb/100/zes_sk_credeb/zes_sk_credeb",
        headers: {
          "Content-Type": "application/soap+xml",
          SOAPAction:
            "urn:sap-com:document:sap:rfc:functions:ZES_SK_CREDEB:ZSK_FM_CREDEBResponse",
          Authorization: "Basic QWJhcGVyOkFiYXBlckAxMjM=",
          Cookie: "sap-usercontext=sap-client=100",
        },
        body:
          '<soap:Envelope xmlns:soap="http://www.w3.org/2003/05/soap-envelope" xmlns:urn="urn:sap-com:document:sap:rfc:functions">\r\n   <soap:Header/>\r\n   <soap:Body>\r\n      <urn:ZSK_FM_CREDEB>\r\n         <!--Optional:-->\r\n         <IT_CREDIT>\r\n            <!--Zero or more repetitions:-->\r\n            <item>\r\n               \r\n            </item>\r\n         </IT_CREDIT>\r\n         <!--Optional:-->\r\n         <IT_DEBIT>\r\n            <!--Zero or more repetitions:-->\r\n            <item>\r\n               \r\n            </item>\r\n         </IT_DEBIT>\r\n         <P_CUSTOMER_ID>' +
        await  storage.getItem("auth") +
          "</P_CUSTOMER_ID>\r\n      </urn:ZSK_FM_CREDEB>\r\n   </soap:Body>\r\n</soap:Envelope>",
      };
    
      request(options, function (error, response) {
        if (error) throw new Error(error);
        var data = new xml();
        var xmljs = data.xml2js(response.body);
        xmljs = JSON.stringify(xmljs);
        res.send(xmljs);
      });
    
      console.log(custid);
    } catch (err) {
      console.error('Error retrieving data:', err);
    }
  })();
 
});

app.post("/payments", function (req, res) {
  (async () => {
    try {
      var options = {
        method: "POST",
        url: "https://dxbktlds4.kaarcloud.com:4300/sap/bc/srt/rfc/sap/zes_sk_payments/100/zes_sk_payments/zes_sk_payments",
        headers: {
          "Content-Type": "application/soap+xml",
          SOAPAction:
            "urn:sap-com:document:sap:rfc:functions:ZSK_FM_PAYMENT:ZSK_FM_PAYMENTResponse",
          Authorization: "Basic QWJhcGVyOkFiYXBlckAxMjM=",
          Cookie: "sap-usercontext=sap-client=100",
        },
        body:
          '<soap:Envelope xmlns:soap="http://www.w3.org/2003/05/soap-envelope" xmlns:urn="urn:sap-com:document:sap:rfc:functions">\r\n   <soap:Header/>\r\n   <soap:Body>\r\n      <urn:ZSK_FM_PAYMENT>\r\n         <!--Optional:-->\r\n         <IT_DET>\r\n            <!--Zero or more repetitions:-->\r\n            <item>\r\n              \r\n            </item>\r\n         </IT_DET>\r\n         <P_CUSTOMER_ID>' +
         await storage.getItem("auth") +
          "</P_CUSTOMER_ID>\r\n      </urn:ZSK_FM_PAYMENT>\r\n   </soap:Body>\r\n</soap:Envelope>",
      };
    
      request(options, function (error, response) {
        if (error) throw new Error(error);
        var data = new xml();
        var xmljs = data.xml2js(response.body);
        xmljs = JSON.stringify(xmljs);
        res.send(xmljs);
      });
    
      console.log(custid);
    } catch (err) {
      console.error('Error retrieving data:', err);
    }
  })();

});
//Done
app.post("/salesorder", function (req, res) {
  (async () => {
    try {
      var options = {
        method: "POST",
        url: "https://dxbktlds4.kaarcloud.com:4300/sap/bc/srt/rfc/sap/zes_sk_saleorder/100/zes_sk_saleorder/zes_sk_saleorder",
        headers: {
          "Content-Type": "application/soap+xml",
          SOAPAction:
            "urn:sap-com:document:sap:rfc:functions:ZES_SK_SALESORDER:ZSK_FM_SALESORDERResponse",
          Authorization: "Basic QWJhcGVyOkFiYXBlckAxMjM=",
          Cookie: "sap-usercontext=sap-client=100",
        },
        body:
          '<soap:Envelope xmlns:soap="http://www.w3.org/2003/05/soap-envelope" xmlns:urn="urn:sap-com:document:sap:rfc:functions">\r\n   <soap:Header/>\r\n   <soap:Body>\r\n      <urn:ZFM_SK_SALESORDER>\r\n         <P_CUSTOMER_ID> ' +
       await   storage.getItem("auth") +
          "</P_CUSTOMER_ID>\r\n         <SALES_ORDER>\r\n            <!--Zero or more repetitions:-->\r\n            <item>\r\n    \r\n            </item>\r\n         </SALES_ORDER>\r\n         <SALES_ORG>0001</SALES_ORG>\r\n      </urn:ZFM_SK_SALESORDER>\r\n   </soap:Body>\r\n</soap:Envelope>",
      };
    
      request(options, function (error, response) {
        if (error) throw new Error(error);
        var data = new xml();
        var xmljs = data.xml2js(response.body);
        xmljs = JSON.stringify(xmljs);
        res.send(xmljs);
      });
    
      console.log(custid);
    } catch (err) {
      console.error('Error retrieving data:', err);
    }
  })();
  
});
//DONE
app.post("/delivery", function (req, res) {
  (async () => {
    try {
      var options = {
        method: "POST",
        url: "https://dxbktlds4.kaarcloud.com:4300/sap/bc/srt/rfc/sap/zes_sk_delivery/100/zes_sk_delivery/zes_sk_delivery",
        headers: {
          "Content-Type": "application/soap+xml",
          SOAPAction:
            "urn:sap-com:document:sap:rfc:functions:ZSK_FM_DELIVERY:ZSK_FM_DELIVERYResponse",
          Authorization: "Basic QWJhcGVyOkFiYXBlckAxMjM=",
          Cookie: "sap-usercontext=sap-client=100",
        },
        body:
          '<soap:Envelope xmlns:soap="http://www.w3.org/2003/05/soap-envelope" xmlns:urn="urn:sap-com:document:sap:rfc:functions">\r\n   <soap:Header/>\r\n   <soap:Body>\r\n      <urn:ZSK_FM_DELIVERY>\r\n         <!--Optional:-->\r\n         <IT_DELIVERY_LIST>\r\n            <!--Zero or more repetitions:-->\r\n            <item>\r\n               \r\n            </item>\r\n         </IT_DELIVERY_LIST>\r\n         <P_CUSTOMER_ID>' +
       await   storage.getItem("auth") +
          "</P_CUSTOMER_ID>\r\n      </urn:ZSK_FM_DELIVERY>\r\n   </soap:Body>\r\n</soap:Envelope>",
      };
    
      request(options, function (error, response) {
        if (error) throw new Error(error);
        var data = new xml();
        var xmljs = data.xml2js(response.body);
        xmljs = JSON.stringify(xmljs);
        res.send(xmljs);
      });
    
      console.log(custid);
      console.log(await storage.getItem("auth"), "local storage");
    } catch (err) {
      console.error('Error retrieving data:', err);
    }
  })();
 
});

app.post("/overallSales", function (req, res) {
  (async () => {
    try {
      var options = {
        method: "POST",
        url: "https://dxbktlds4.kaarcloud.com:4300/sap/bc/srt/rfc/sap/zes_sk_overall_sales/100/zes_sk_overall_sales1/zes_sk_overall_sales1",
        headers: {
          "Content-Type": "application/soap+xml",
          SOAPAction:
            "urn:sap-com:document:sap:rfc:functions:ZFM_SK_OVERALLSALESORDER:ZFM_SK_OVERALLSALESORDERResponse",
          Authorization: "Basic QWJhcGVyOkFiYXBlckAxMjM=",
          Cookie: "sap-usercontext=sap-client=100",
        },
        body:
          '<soap:Envelope xmlns:soap="http://www.w3.org/2003/05/soap-envelope" xmlns:urn="urn:sap-com:document:sap:rfc:functions">\r\n   <soap:Header/>\r\n   <soap:Body>\r\n      <urn:ZFM_SK_OVERALLSALESORDER>\r\n         <!--Optional:-->\r\n         <IT_SALES_ORDER>\r\n            <!--Zero or more repetitions:-->\r\n            <item>\r\n                \r\n               \r\n            </item>\r\n         </IT_SALES_ORDER>\r\n         <P_CUSTOMER_ID>' +
        await  storage.getItem("auth") +
          "</P_CUSTOMER_ID>\r\n      </urn:ZFM_SK_OVERALLSALESORDER>\r\n   </soap:Body>\r\n</soap:Envelope>",
      };
    
      request(options, function (error, response) {
        if (error) throw new Error(error);
        var data = new xml();
        var xmljs = data.xml2js(response.body);
        xmljs = JSON.stringify(xmljs);
        res.send(xmljs);
      });
    
       
       
    } catch (err) {
      console.error('Error retrieving data:', err);
    }
  })();
 
});

//                   Vendor portal
var venid;
app.post("/vendor/login", function (req, res) {
  var custpass;

  venid = req.body.venid;
  venpass = req.body.venpass;

  console.log(venid, venpass);
  storage.setItem("auth_ven", venid);
  var options = {
    method: "POST",
    url: "http://dxktpipo.kaarcloud.com:50000/XISOAPAdapter/MessageServlet?senderParty=&senderService=BC_SK_VEN_LOGIN_&receiverParty=&receiverService=&interface=SI_SK_VEN_LOGIN_001&interfaceNamespace=http://vendorPortal_sk.com",
    headers: {
      "Content-Type": "application/soap+xml",
      SOAPAction:
        "urn:sap-com:document:sap:rfc:functions:ZFM_SK_VEN_LOGIN_001:ZFM_SK_VEN_LOGIN_001.Response",
      Authorization: "Basic cG91c2VyQDQ6MjAyMkBUZWNo",
      Cookie:
        "MYSAPSSO2=AjExMDAgAA9wb3J0YWw6cG91c2VyQDSIAAdkZWZhdWx0AQAIUE9VU0VSQDQCAAMwMDADAANLUE8EAAwyMDIzMDQxOTEwNTIFAAQAAAAICgAIUE9VU0VSQDT%2FAQYwggECBgkqhkiG9w0BBwKggfQwgfECAQExCzAJBgUrDgMCGgUAMAsGCSqGSIb3DQEHATGB0TCBzgIBATAiMB0xDDAKBgNVBAMTA0tQTzENMAsGA1UECxMESjJFRQIBADAJBgUrDgMCGgUAoF0wGAYJKoZIhvcNAQkDMQsGCSqGSIb3DQEHATAcBgkqhkiG9w0BCQUxDxcNMjMwNDE5MTA1MjQzWjAjBgkqhkiG9w0BCQQxFgQU29PHG%2FAK8%2FrO8MiGdpqxA!82EjcwCQYHKoZIzjgEAwQwMC4CFQC7brb0SmSdxD58iBP06a3fOygwlgIVAO9LszysD3BgDUsOt5kQt5pQ9XIU; JSESSIONID=asgUQH5-bPCTX4UB3N0PbLcELSWZhwF-Y2kA_SAPaLFn4NBfZ5w6NtiuJY18_gyy; saplb_*=(J2EE6906720)6906750",
    },
    body:
      '<soapenv:Envelope xmlns:soapenv="http://schemas.xmlsoap.org/soap/envelope/" xmlns:urn="urn:sap-com:document:sap:rfc:functions">\r\n   <soapenv:Header/>\r\n   <soapenv:Body>\r\n      <urn:ZFM_SK_VEN_LOGIN_001>\r\n         <!--You may enter the following 2 items in any order-->\r\n         <P_VENDOR_ID>' +
      venid +
      "</P_VENDOR_ID>\r\n         <P_VENDOR_PASS>" +
      venpass +
      "</P_VENDOR_PASS>\r\n      </urn:ZFM_SK_VEN_LOGIN_001>\r\n   </soapenv:Body>\r\n</soapenv:Envelope>",
  };
  request(options, function (error, response) {
    if (error) throw new Error(error);
    var data = new xml();
    var xmljs = data.xml2js(response.body);
    xmljs = JSON.stringify(xmljs);
    res.send(xmljs);
  });
});
app.post("/vendor/invoice", function (req, res) {
  (async () => {
    try {
      var options = {
        method: "POST",
        url: "http://dxktpipo.kaarcloud.com:50000/XISOAPAdapter/MessageServlet?senderParty=&senderService=BC_SK_VEN_LOGIN_&receiverParty=&receiverService=&interface=SI_SK_VEN_INVOICE&interfaceNamespace=http://vendorPortal_sk.com",
        headers: {
          "Content-Type": "application/soap+xml",
          SOAPAction:
            "urn:sap-com:document:sap:rfc:functions:ZFM_SK_VEN_INVOICE:ZFM_SK_VEN_INVOICE.Response",
          Authorization: "Basic cG91c2VyQDQ6MjAyMkBUZWNo",
          Cookie:
            "MYSAPSSO2=AjExMDAgAA9wb3J0YWw6cG91c2VyQDSIAAdkZWZhdWx0AQAIUE9VU0VSQDQCAAMwMDADAANLUE8EAAwyMDIzMDQxMjEyMDEFAAQAAAAICgAIUE9VU0VSQDT%2FAQUwggEBBgkqhkiG9w0BBwKggfMwgfACAQExCzAJBgUrDgMCGgUAMAsGCSqGSIb3DQEHATGB0DCBzQIBATAiMB0xDDAKBgNVBAMTA0tQTzENMAsGA1UECxMESjJFRQIBADAJBgUrDgMCGgUAoF0wGAYJKoZIhvcNAQkDMQsGCSqGSIb3DQEHATAcBgkqhkiG9w0BCQUxDxcNMjMwNDEyMTIwMTQ0WjAjBgkqhkiG9w0BCQQxFgQUzlx%2FG0r9av%2FXQniKhPUImnPPl4MwCQYHKoZIzjgEAwQvMC0CFBGu%2FUKsAQfpfyHgdpX07i8w7rO0AhUAn50e8ha0ygtjWYDT1%2FDlozGZCIs%3D; JSESSIONID=SAbu_wD0OFlF1tsYEuGBfwJD2ld1hwF-Y2kA_SAPKYrO2yPZU5tuJUFUG9njb2Y0; JSESSIONMARKID=UezAtwWonYF1CYx6wQ19Okk17t1c9Xts3f6X5jaQA; saplb_*=(J2EE6906720)6906750",
        },
        body:
          '<soapenv:Envelope xmlns:soapenv="http://schemas.xmlsoap.org/soap/envelope/" xmlns:urn="urn:sap-com:document:sap:rfc:functions">\r\n   <soapenv:Header/>\r\n   <soapenv:Body>\r\n      <urn:ZFM_SK_VEN_INVOICE>\r\n         <!--You may enter the following 2 items in any order-->\r\n         <P_VENDOR_ID>' +
        await  storage.getItem("auth_ven") +
          "</P_VENDOR_ID>\r\n         <VENDINVOICE>\r\n            <!--Zero or more repetitions:-->\r\n            <item>\r\n               <!--Optional:-->\r\n             \r\n            </item>\r\n         </VENDINVOICE>\r\n      </urn:ZFM_SK_VEN_INVOICE>\r\n   </soapenv:Body>\r\n</soapenv:Envelope>",
      };
      request(options, function (error, response) {
        if (error) throw new Error(error);
        var data = new xml();
        var xmljs = data.xml2js(response.body);
        xmljs = JSON.stringify(xmljs);
        res.send(xmljs);
      });
    } catch (err) {
      console.error('Error retrieving data:', err);
    }
  })();
 
});
app.post("/vendor/payage", function (req, res) {
  (async () => {
    try {
      var options = {
        method: "POST",
        url: "http://dxktpipo.kaarcloud.com:50000/XISOAPAdapter/MessageServlet?senderParty=&senderService=BC_SK_VEN_LOGIN_&receiverParty=&receiverService=&interface=SI_SK_VEN_PAYAGE_001&interfaceNamespace=http://vendorPortal_sk.com",
        headers: {
          "Content-Type": "application/soap+xml",
          SOAPAction:
            "urn:sap-com:document:sap:rfc:functions:ZFM_SK_VEN_PAYAGE_001:ZFM_SK_VEN_PAYAGE_001.Response",
          Authorization: "Basic cG91c2VyQDQ6MjAyMkBUZWNo",
        },
        body:
          '<soapenv:Envelope xmlns:soapenv="http://schemas.xmlsoap.org/soap/envelope/" xmlns:urn="urn:sap-com:document:sap:rfc:functions">\r\n   <soapenv:Header/>\r\n   <soapenv:Body>\r\n      <urn:ZFM_SK_VEN_PAYAGE_001>\r\n         <!--You may enter the following 2 items in any order-->\r\n         <P_VENDOR_ID>' +
        await  storage.getItem("auth_ven") +
          "</P_VENDOR_ID>\r\n         <PAYMENT_AGING>\r\n            <!--Zero or more repetitions:-->\r\n            <item>\r\n               \r\n            </item>\r\n         </PAYMENT_AGING>\r\n      </urn:ZFM_SK_VEN_PAYAGE_001>\r\n   </soapenv:Body>\r\n</soapenv:Envelope>",
      };
      request(options, function (error, response) {
        if (error) throw new Error(error);
        var data = new xml();
        var xmljs = data.xml2js(response.body);
        xmljs = JSON.stringify(xmljs);
        res.send(xmljs);
      });
    } catch (err) {
      console.error('Error retrieving data:', err);
    }
  })();
 
});
app.post("/vendor/credit-debit", function (req, res) {
  (async () => {
    try {
      var options = {
        method: "POST",
        url: "http://dxktpipo.kaarcloud.com:50000/XISOAPAdapter/MessageServlet?senderParty=&senderService=BC_SK_VEN_PORTAL&receiverParty=&receiverService=&interface=SI_SK_VEN_CREDEBIT&interfaceNamespace=http://vendorPortal_sk.com",
        headers: {
          "Content-Type": "application/soap+xml",
          SOAPAction:
            "urn:sap-com:document:sap:rfc:functions:ZFM_SK_VEN_CREDEB:ZFM_SK_VEN_CREDEB.Response",
          Authorization: "Basic cG91c2VyQDQ6MjAyMkBUZWNo",
          Cookie:
            "MYSAPSSO2=AjExMDAgAA9wb3J0YWw6cG91c2VyQDSIAAdkZWZhdWx0AQAIUE9VU0VSQDQCAAMwMDADAANLUE8EAAwyMDIzMDQxMzAzNDYFAAQAAAAICgAIUE9VU0VSQDT%2FAQQwggEABgkqhkiG9w0BBwKggfIwge8CAQExCzAJBgUrDgMCGgUAMAsGCSqGSIb3DQEHATGBzzCBzAIBATAiMB0xDDAKBgNVBAMTA0tQTzENMAsGA1UECxMESjJFRQIBADAJBgUrDgMCGgUAoF0wGAYJKoZIhvcNAQkDMQsGCSqGSIb3DQEHATAcBgkqhkiG9w0BCQUxDxcNMjMwNDEzMDM0NjIxWjAjBgkqhkiG9w0BCQQxFgQUjxFxxz1Htnw9t0T3XY8zcJdEdLgwCQYHKoZIzjgEAwQuMCwCFCKvYYE7%2FCbypAdvr82HRq4o6FhWAhQf5WNCD3xeI5onkoqZvCBwePYBvQ%3D%3D; JSESSIONID=AckkER1z0aJWJFf2rIHI60syq7h4hwF-Y2kA_SAP__145upV3VrUCdnaTcir_AZ9; JSESSIONMARKID=qmQhpAZdf5vRzTJ4HuQuIugRU6e2tTvHk8HX5jaQA; saplb_*=(J2EE6906720)6906750",
        },
        body:
          '<soapenv:Envelope xmlns:soapenv="http://schemas.xmlsoap.org/soap/envelope/" xmlns:urn="urn:sap-com:document:sap:rfc:functions">\r\n   <soapenv:Header/>\r\n   <soapenv:Body>\r\n      <urn:ZFM_SK_VEN_CREDEB>\r\n         <!--You may enter the following 3 items in any order-->\r\n         <P_VENDOR_ID>' +
       await   storage.getItem("auth_ven") +
          "</P_VENDOR_ID>\r\n         <VENDOR_CREDIT_TAB>\r\n            <!--Zero or more repetitions:-->\r\n            <item>\r\n                \r\n            </item>\r\n         </VENDOR_CREDIT_TAB>\r\n         <VENDOR_DEBIT_TAB>\r\n            <!--Zero or more repetitions:-->\r\n            <item>\r\n               <!--Optional:-->\r\n               \r\n            </item>\r\n         </VENDOR_DEBIT_TAB>\r\n      </urn:ZFM_SK_VEN_CREDEB>\r\n   </soapenv:Body>\r\n</soapenv:Envelope>",
      };
      request(options, function (error, response) {
        if (error) throw new Error(error);
        var data = new xml();
        var xmljs = data.xml2js(response.body);
        xmljs = JSON.stringify(xmljs);
        res.send(xmljs);
      });
    } catch (err) {
      console.error('Error retrieving data:', err);
    }
  })();
  
});
app.post("/vendor/quotation", function (req, res) {
  (async () => {
    try {
      var options = {
        method: "POST",
        url: "http://dxktpipo.kaarcloud.com:50000/XISOAPAdapter/MessageServlet?senderParty=&senderService=BC_SK_VEN_PORTAL&receiverParty=&receiverService=&interface=SI_SK_VEN_QUOTATION&interfaceNamespace=http://vendorPortal_sk.com",
        headers: {
          "Content-Type": "application/soap+xml",
          SOAPAction:
            "urn:sap-com:document:sap:rfc:functions:ZFM_SK_VEN_QUOTATION:ZFM_SK_VEN_QUOTATION.Response",
          Authorization: "Basic cG91c2VyQDQ6MjAyMkBUZWNo",
          Cookie:
            "MYSAPSSO2=AjExMDAgAA9wb3J0YWw6cG91c2VyQDSIAAdkZWZhdWx0AQAIUE9VU0VSQDQCAAMwMDADAANLUE8EAAwyMDIzMDQxMzAzNDYFAAQAAAAICgAIUE9VU0VSQDT%2FAQQwggEABgkqhkiG9w0BBwKggfIwge8CAQExCzAJBgUrDgMCGgUAMAsGCSqGSIb3DQEHATGBzzCBzAIBATAiMB0xDDAKBgNVBAMTA0tQTzENMAsGA1UECxMESjJFRQIBADAJBgUrDgMCGgUAoF0wGAYJKoZIhvcNAQkDMQsGCSqGSIb3DQEHATAcBgkqhkiG9w0BCQUxDxcNMjMwNDEzMDM0NjIxWjAjBgkqhkiG9w0BCQQxFgQUjxFxxz1Htnw9t0T3XY8zcJdEdLgwCQYHKoZIzjgEAwQuMCwCFCKvYYE7%2FCbypAdvr82HRq4o6FhWAhQf5WNCD3xeI5onkoqZvCBwePYBvQ%3D%3D; JSESSIONID=Fiapg9FcuN3p31v37Cub2cTiIAR5hwF-Y2kA_SAP4bV17DY2lC5iPTYGmZ51mZP5; JSESSIONMARKID=1aSiJwAAl72f61bzm73pehF-epf1FVO-a7IX5jaQA; saplb_*=(J2EE6906720)6906750",
        },
        body:
          '<soapenv:Envelope xmlns:soapenv="http://schemas.xmlsoap.org/soap/envelope/" xmlns:urn="urn:sap-com:document:sap:rfc:functions">\r\n   <soapenv:Header/>\r\n   <soapenv:Body>\r\n      <urn:ZFM_SK_VEN_QUOTATION>\r\n         <!--You may enter the following 2 items in any order-->\r\n         <P_VENDOR_ID>' +
       await   storage.getItem("auth_ven") +
          "</P_VENDOR_ID>\r\n         <VENDQUOTATION>\r\n            <!--Zero or more repetitions:-->\r\n            <item>\r\n               \r\n            </item>\r\n         </VENDQUOTATION>\r\n      </urn:ZFM_SK_VEN_QUOTATION>\r\n   </soapenv:Body>\r\n</soapenv:Envelope>",
      };
      request(options, function (error, response) {
        if (error) throw new Error(error);
        var data = new xml();
        var xmljs = data.xml2js(response.body);
        xmljs = JSON.stringify(xmljs);
        res.send(xmljs);
      });
    } catch (err) {
      console.error('Error retrieving data:', err);
    }
  })();
  
});
app.post("/vendor/goods", function (req, res) {
  (async () => {
    try {
      var options = {
        method: "POST",
        url: "http://dxktpipo.kaarcloud.com:50000/XISOAPAdapter/MessageServlet?senderParty=&senderService=BC_SK_VEN_LOGIN_&receiverParty=&receiverService=&interface=SI_SK_VEN_GOODS&interfaceNamespace=http://vendorPortal_sk.com",
        headers: {
          "Content-Type": "application/soap+xml",
          SOAPAction:
            "urn:sap-com:document:sap:rfc:functions:ZFM_SK_VEN_GOODS:ZFM_SK_VEN_GOODS.Response",
          Authorization: "Basic cG91c2VyQDQ6MjAyMkBUZWNo",
          Cookie:
            "MYSAPSSO2=AjExMDAgAA9wb3J0YWw6cG91c2VyQDSIAAdkZWZhdWx0AQAIUE9VU0VSQDQCAAMwMDADAANLUE8EAAwyMDIzMDQxMzAzNDYFAAQAAAAICgAIUE9VU0VSQDT%2FAQQwggEABgkqhkiG9w0BBwKggfIwge8CAQExCzAJBgUrDgMCGgUAMAsGCSqGSIb3DQEHATGBzzCBzAIBATAiMB0xDDAKBgNVBAMTA0tQTzENMAsGA1UECxMESjJFRQIBADAJBgUrDgMCGgUAoF0wGAYJKoZIhvcNAQkDMQsGCSqGSIb3DQEHATAcBgkqhkiG9w0BCQUxDxcNMjMwNDEzMDM0NjIxWjAjBgkqhkiG9w0BCQQxFgQUjxFxxz1Htnw9t0T3XY8zcJdEdLgwCQYHKoZIzjgEAwQuMCwCFCKvYYE7%2FCbypAdvr82HRq4o6FhWAhQf5WNCD3xeI5onkoqZvCBwePYBvQ%3D%3D; JSESSIONID=Fiapg9FcuN3p31v37Cub2cTiIAR5hwF-Y2kA_SAP4bV17DY2lC5iPTYGmZ51mZP5; JSESSIONMARKID=ZHeVNQFdd5IMsYfu9qJ-uQeh3cbIKPlBLEJX5jaQA; saplb_*=(J2EE6906720)6906750",
        },
        body:
          '<soapenv:Envelope xmlns:soapenv="http://schemas.xmlsoap.org/soap/envelope/" xmlns:urn="urn:sap-com:document:sap:rfc:functions">\r\n   <soapenv:Header/>\r\n   <soapenv:Body>\r\n      <urn:ZFM_SK_VEN_GOODS>\r\n         <!--You may enter the following 4 items in any order-->\r\n         <P_VENDOR_ID>' +
        await  storage.getItem("auth_ven") +
          "</P_VENDOR_ID>\r\n         <GOODS_HEADER>\r\n            <!--Zero or more repetitions:-->\r\n            <item>\r\n          \r\n            </item>\r\n         </GOODS_HEADER>\r\n         <GOODS_ITEMS>\r\n            <!--Zero or more repetitions:-->\r\n            <item>\r\n               \r\n            </item>\r\n         </GOODS_ITEMS>\r\n         <RETURN>\r\n            <!--Zero or more repetitions:-->\r\n            <item>\r\n              \r\n            </item>\r\n         </RETURN>\r\n      </urn:ZFM_SK_VEN_GOODS>\r\n   </soapenv:Body>\r\n</soapenv:Envelope>",
      };
      request(options, function (error, response) {
        if (error) throw new Error(error);
        var data = new xml();
        var xmljs = data.xml2js(response.body);
        xmljs = JSON.stringify(xmljs);
        res.send(xmljs);
      });
    } catch (err) {
      console.error('Error retrieving data:', err);
    }
  })();
 
});
app.post("/vendor/purchase-order", function (req, res) {
  (async () => {
    try {
      var options = {
        method: "POST",
        url: "http://dxktpipo.kaarcloud.com:50000/XISOAPAdapter/MessageServlet?senderParty=&senderService=BC_SK_VEN_PORTAL&receiverParty=&receiverService=&interface=SI_SK_VEN_PURCHASE&interfaceNamespace=http://vendorPortal_sk.com",
        headers: {
          "Content-Type": "application/soap+xml",
          SOAPAction:
            "urn:sap-com:document:sap:rfc:functions:ZFM_SK_VEN_PURCHASE:ZFM_SK_VEN_PURCHASE.Response",
          Authorization: "Basic cG91c2VyQDQ6MjAyMkBUZWNo",
          Cookie:
            "MYSAPSSO2=AjExMDAgAA9wb3J0YWw6cG91c2VyQDSIAAdkZWZhdWx0AQAIUE9VU0VSQDQCAAMwMDADAANLUE8EAAwyMDIzMDQxNDA1MjIFAAQAAAAICgAIUE9VU0VSQDT%2FAQUwggEBBgkqhkiG9w0BBwKggfMwgfACAQExCzAJBgUrDgMCGgUAMAsGCSqGSIb3DQEHATGB0DCBzQIBATAiMB0xDDAKBgNVBAMTA0tQTzENMAsGA1UECxMESjJFRQIBADAJBgUrDgMCGgUAoF0wGAYJKoZIhvcNAQkDMQsGCSqGSIb3DQEHATAcBgkqhkiG9w0BCQUxDxcNMjMwNDE0MDUyMjU3WjAjBgkqhkiG9w0BCQQxFgQURZSAX5oEDrA4Hv5AddplQQFVrK4wCQYHKoZIzjgEAwQvMC0CFQCWlJM77nOIZtR4qe%2Fw7ZCX%2Fz7pogIUUJpTLUSy15DZRafIUP1T4ilOyk4%3D; JSESSIONID=IGM_XK2i5Yvt8xiE-gKovDm5eTd-hwF-Y2kA_SAPjABWaybyn7tTXoVgCkVmeI6U; JSESSIONMARKID=v4K96Q_ECgldHKCl6oxa8g4azjHQNyQZEycX5jaQA; saplb_*=(J2EE6906720)6906750",
        },
        body:
          '<soapenv:Envelope xmlns:soapenv="http://schemas.xmlsoap.org/soap/envelope/" xmlns:urn="urn:sap-com:document:sap:rfc:functions">\r\n   <soapenv:Header/>\r\n   <soapenv:Body>\r\n      <urn:ZFM_SK_VEN_PURCHASE>\r\n         <!--You may enter the following 4 items in any order-->\r\n         <P_VENDOR_ID>' +
       await   storage.getItem("auth_ven") +
          "</P_VENDOR_ID>\r\n         <PURCHASE_ORDER_HEADER>\r\n            <!--Zero or more repetitions:-->\r\n            <item>\r\n              \r\n            </item>\r\n         </PURCHASE_ORDER_HEADER>\r\n         <PURCHASE_ORDER_ITEMS>\r\n            <!--Zero or more repetitions:-->\r\n            <item>\r\n               \r\n            </item>\r\n         </PURCHASE_ORDER_ITEMS>\r\n         <RETURN>\r\n            <!--Zero or more repetitions:-->\r\n            <item>\r\n               \r\n            </item>\r\n         </RETURN>\r\n      </urn:ZFM_SK_VEN_PURCHASE>\r\n   </soapenv:Body>\r\n</soapenv:Envelope>",
      };
      request(options, function (error, response) {
        if (error) throw new Error(error);
        var data = new xml();
        var xmljs = data.xml2js(response.body);
        xmljs = JSON.stringify(xmljs);
        res.send(xmljs);
      });
    } catch (err) {
      console.error('Error retrieving data:', err);
    }
  })();
 
});
app.post("/vendor/profile", function (req, res) {
  (async () => {
    try {
      var options = {
        method: "POST",
        url: "http://dxktpipo.kaarcloud.com:50000/XISOAPAdapter/MessageServlet?senderParty=&senderService=BC_SK_VEN_PORTAL&receiverParty=&receiverService=&interface=SI_SK_VEN_PROFILE&interfaceNamespace=http://vendorPortal_sk.com",
        headers: {
          "Content-Type": "application/soap+xml",
          SOAPAction:
            "urn:sap-com:document:sap:rfc:functions:ZFM_SK_VEN_PROFILE:ZFM_SK_VEN_PROFILE.Response",
          Authorization: "Basic cG91c2VyQDQ6MjAyMkBUZWNo",
          Cookie:
            "MYSAPSSO2=AjExMDAgAA9wb3J0YWw6cG91c2VyQDSIAAdkZWZhdWx0AQAIUE9VU0VSQDQCAAMwMDADAANLUE8EAAwyMDIzMDQxMzAzNDYFAAQAAAAICgAIUE9VU0VSQDT%2FAQQwggEABgkqhkiG9w0BBwKggfIwge8CAQExCzAJBgUrDgMCGgUAMAsGCSqGSIb3DQEHATGBzzCBzAIBATAiMB0xDDAKBgNVBAMTA0tQTzENMAsGA1UECxMESjJFRQIBADAJBgUrDgMCGgUAoF0wGAYJKoZIhvcNAQkDMQsGCSqGSIb3DQEHATAcBgkqhkiG9w0BCQUxDxcNMjMwNDEzMDM0NjIxWjAjBgkqhkiG9w0BCQQxFgQUjxFxxz1Htnw9t0T3XY8zcJdEdLgwCQYHKoZIzjgEAwQuMCwCFCKvYYE7%2FCbypAdvr82HRq4o6FhWAhQf5WNCD3xeI5onkoqZvCBwePYBvQ%3D%3D; JSESSIONID=Fiapg9FcuN3p31v37Cub2cTiIAR5hwF-Y2kA_SAP4bV17DY2lC5iPTYGmZ51mZP5; JSESSIONMARKID=ZHeVNQFdd5IMsYfu9qJ-uQeh3cbIKPlBLEJX5jaQA; saplb_*=(J2EE6906720)6906750",
        },
        body:
          '<soapenv:Envelope xmlns:soapenv="http://schemas.xmlsoap.org/soap/envelope/" xmlns:urn="urn:sap-com:document:sap:rfc:functions">\r\n   <soapenv:Header/>\r\n   <soapenv:Body>\r\n      <urn:ZFM_SK_VEN_PROFILE>\r\n         <!--You may enter the following 2 items in any order-->\r\n         <P_VENDOR_ID>' +
        await  storage.getItem("auth_ven") +
          "</P_VENDOR_ID>\r\n         <VENDPROFILE>\r\n            <!--Zero or more repetitions:-->\r\n            <item>\r\n               \r\n            </item>\r\n         </VENDPROFILE>\r\n      </urn:ZFM_SK_VEN_PROFILE>\r\n   </soapenv:Body>\r\n</soapenv:Envelope>",
      };
      request(options, function (error, response) {
        if (error) throw new Error(error);
        var data = new xml();
        var xmljs = data.xml2js(response.body);
        xmljs = JSON.stringify(xmljs);
        res.send(xmljs);
      });
    } catch (err) {
      console.error('Error retrieving data:', err);
    }
  })();
  
});
app.get("/vendor/logout", function (req, res) {
  (async () => {
    try {
    await  storage.removeItem("auth_ven");
      console.log(storage.getItem("auth_ven"), "logout");
      res.send("Logged out successfully");
    } catch (err) {
      console.error('Error retrieving data:', err);
    }
  })();

});
//                 RFC Vendor Portal

app.post("/vendor/rfc/credit-debit", function (req, res) {
  (async () => {
    try {
      const value = await storage.getItem('key');
      console.log(value); // Output: 'value'
    } catch (err) {
      console.error('Error retrieving data:', err);
    }
  })();
  var options = {
    method: "POST",
    url: "https://dxbktlds4.kaarcloud.com:4300/sap/bc/srt/rfc/sap/zes_sk_ven_credeb/100/zes_sk_ven_credeb/zes_sk_ven_credeb",
    headers: {
      "Content-Type": "application/soap+xml",
      SOAPAction:
        "urn:sap-com:document:sap:rfc:functions:ZFM_SK_VEN_CREDEB:ZFM_SK_VEN_CREDEBResponse",
      Authorization: "Basic QWJhcGVyOkFiYXBlckAxMjM=",
      Cookie:
        "MYSAPSSO2=AjExMDAgAA9wb3J0YWw6cG91c2VyQDSIAAdkZWZhdWx0AQAIUE9VU0VSQDQCAAMwMDADAANLUE8EAAwyMDIzMDQxMzAzNDYFAAQAAAAICgAIUE9VU0VSQDT%2FAQQwggEABgkqhkiG9w0BBwKggfIwge8CAQExCzAJBgUrDgMCGgUAMAsGCSqGSIb3DQEHATGBzzCBzAIBATAiMB0xDDAKBgNVBAMTA0tQTzENMAsGA1UECxMESjJFRQIBADAJBgUrDgMCGgUAoF0wGAYJKoZIhvcNAQkDMQsGCSqGSIb3DQEHATAcBgkqhkiG9w0BCQUxDxcNMjMwNDEzMDM0NjIxWjAjBgkqhkiG9w0BCQQxFgQUjxFxxz1Htnw9t0T3XY8zcJdEdLgwCQYHKoZIzjgEAwQuMCwCFCKvYYE7%2FCbypAdvr82HRq4o6FhWAhQf5WNCD3xeI5onkoqZvCBwePYBvQ%3D%3D; sap-usercontext=sap-client=100",
    },
    body: '<soap:Envelope xmlns:soap="http://www.w3.org/2003/05/soap-envelope" xmlns:urn="urn:sap-com:document:sap:rfc:functions">\r\n   <soap:Header/>\r\n   <soap:Body>\r\n      <urn:ZFM_SK_VEN_CREDEB>\r\n         <P_VENDOR_ID>1</P_VENDOR_ID>\r\n         <VENDOR_CREDIT_TAB>\r\n            <!--Zero or more repetitions:-->\r\n            <item>\r\n                \r\n            </item>\r\n         </VENDOR_CREDIT_TAB>\r\n         <VENDOR_DEBIT_TAB>\r\n            <!--Zero or more repetitions:-->\r\n            <item>\r\n               \r\n            </item>\r\n         </VENDOR_DEBIT_TAB>\r\n      </urn:ZFM_SK_VEN_CREDEB>\r\n   </soap:Body>\r\n</soap:Envelope>',
  };
  request(options, function (error, response) {
    if (error) throw new Error(error);
    var data = new xml();
    var xmljs = data.xml2js(response.body);
    xmljs = JSON.stringify(xmljs);
    res.send(xmljs);
  });
});

//                 Employee Portal
var empid;
app.post("/employee/login", function (req, res) {
  var empass;

  empid = req.body.empid;
  empass = req.body.empass;
  console.log(empid, empass, "fafafa");

  storage.setItem("auth_emp", empid);
  var options = {
    method: "POST",
    url: "http://dxktpipo.kaarcloud.com:50000/XISOAPAdapter/MessageServlet?senderParty=&senderService=BC_SK_EMPL&receiverParty=&receiverService=&interface=SI_SK_EMPL_LOGIN&interfaceNamespace=http://employeePortal_sk.com",
    headers: {
      "Content-Type": "application/soap+xml",
      SOAPAction:
        "urn:sap-com:document:sap:rfc:functions:ZFM_SK_EMP_LOGIN:ZFM_SK_EMP_LOGIN.Response",
      Authorization: "Basic cG91c2VyQDQ6MjAyMkBUZWNo",
      Cookie:
        "MYSAPSSO2=AjExMDAgAA9wb3J0YWw6cG91c2VyQDSIAAdkZWZhdWx0AQAIUE9VU0VSQDQCAAMwMDADAANLUE8EAAwyMDIzMDQxNDA1MjIFAAQAAAAICgAIUE9VU0VSQDT%2FAQUwggEBBgkqhkiG9w0BBwKggfMwgfACAQExCzAJBgUrDgMCGgUAMAsGCSqGSIb3DQEHATGB0DCBzQIBATAiMB0xDDAKBgNVBAMTA0tQTzENMAsGA1UECxMESjJFRQIBADAJBgUrDgMCGgUAoF0wGAYJKoZIhvcNAQkDMQsGCSqGSIb3DQEHATAcBgkqhkiG9w0BCQUxDxcNMjMwNDE0MDUyMjU3WjAjBgkqhkiG9w0BCQQxFgQURZSAX5oEDrA4Hv5AddplQQFVrK4wCQYHKoZIzjgEAwQvMC0CFQCWlJM77nOIZtR4qe%2Fw7ZCX%2Fz7pogIUUJpTLUSy15DZRafIUP1T4ilOyk4%3D; JSESSIONID=IGM_XK2i5Yvt8xiE-gKovDm5eTd-hwF-Y2kA_SAPjABWaybyn7tTXoVgCkVmeI6U; JSESSIONMARKID=v4K96Q_ECgldHKCl6oxa8g4azjHQNyQZEycX5jaQA; saplb_*=(J2EE6906720)6906750",
    },
    body:
      '<soapenv:Envelope xmlns:soapenv="http://schemas.xmlsoap.org/soap/envelope/" xmlns:urn="urn:sap-com:document:sap:rfc:functions">\r\n   <soapenv:Header/>\r\n   <soapenv:Body>\r\n      <urn:ZFM_SK_EMP_LOGIN>\r\n         <!--You may enter the following 2 items in any order-->\r\n         <P_EMPLOYEE_ID>' +
      empid +
      "</P_EMPLOYEE_ID>\r\n         <P_EMPLOYEE_PASS>" +
      empass +
      "</P_EMPLOYEE_PASS>\r\n      </urn:ZFM_SK_EMP_LOGIN>\r\n   </soapenv:Body>\r\n</soapenv:Envelope>",
  };
  request(options, function (error, response) {
    if (error) throw new Error(error);
    var data = new xml();
    var xmljs = data.xml2js(response.body);
    xmljs = JSON.stringify(xmljs);
    res.send(xmljs);
  });
});
app.post("/employee/leave", function (req, res) {
  let value;
  (async () => {
    try {
      value = await storage.getItem("auth_emp");

      var options = {
        method: "POST",
        url: "http://dxktpipo.kaarcloud.com:50000/XISOAPAdapter/MessageServlet?senderParty=&senderService=BC_SK_EMPL&receiverParty=&receiverService=&interface=SI_SK_EMPL_LEAVE&interfaceNamespace=http://employeePortal_sk.com",
        headers: {
          "Content-Type": "application/soap+xml",
          SOAPAction:
            "urn:sap-com:document:sap:rfc:functions:ZFM_SK_EMP_LEAVE:ZFM_SK_EMP_LEAVE.Response",
          Authorization: "Basic cG91c2VyQDQ6MjAyMkBUZWNo",
          Cookie:
            "MYSAPSSO2=AjExMDAgAA9wb3J0YWw6cG91c2VyQDSIAAdkZWZhdWx0AQAIUE9VU0VSQDQCAAMwMDADAANLUE8EAAwyMDIzMDQxNDA1MjIFAAQAAAAICgAIUE9VU0VSQDT%2FAQUwggEBBgkqhkiG9w0BBwKggfMwgfACAQExCzAJBgUrDgMCGgUAMAsGCSqGSIb3DQEHATGB0DCBzQIBATAiMB0xDDAKBgNVBAMTA0tQTzENMAsGA1UECxMESjJFRQIBADAJBgUrDgMCGgUAoF0wGAYJKoZIhvcNAQkDMQsGCSqGSIb3DQEHATAcBgkqhkiG9w0BCQUxDxcNMjMwNDE0MDUyMjU3WjAjBgkqhkiG9w0BCQQxFgQURZSAX5oEDrA4Hv5AddplQQFVrK4wCQYHKoZIzjgEAwQvMC0CFQCWlJM77nOIZtR4qe%2Fw7ZCX%2Fz7pogIUUJpTLUSy15DZRafIUP1T4ilOyk4%3D; JSESSIONID=IGM_XK2i5Yvt8xiE-gKovDm5eTd-hwF-Y2kA_SAPjABWaybyn7tTXoVgCkVmeI6U; JSESSIONMARKID=v4K96Q_ECgldHKCl6oxa8g4azjHQNyQZEycX5jaQA; saplb_*=(J2EE6906720)6906750",
        },
        body:
          '<soapenv:Envelope xmlns:soapenv="http://schemas.xmlsoap.org/soap/envelope/" xmlns:urn="urn:sap-com:document:sap:rfc:functions">\r\n   <soapenv:Header/>\r\n   <soapenv:Body>\r\n      <urn:ZFM_SK_EMP_LEAVE>\r\n         <!--You may enter the following 2 items in any order-->\r\n         <P_EMPLOYEE_ID>' +
          value +
          "</P_EMPLOYEE_ID>\r\n         <!--Optional:-->\r\n         <IT_EMPLEAVE>\r\n            <!--Zero or more repetitions:-->\r\n            <item>\r\n               \r\n            </item>\r\n         </IT_EMPLEAVE>\r\n      </urn:ZFM_SK_EMP_LEAVE>\r\n   </soapenv:Body>\r\n</soapenv:Envelope>",
      };
      console.log(value, "again");
      request(options, function (error, response) {
        if (error) throw new Error(error);
        var data = new xml();
        var xmljs = data.xml2js(response.body);
        xmljs = JSON.stringify(xmljs);

        res.send(xmljs);
      });
    } catch (err) {
      console.error("Error retrieving data:", err);
    }
  })();
});
app.post("/employee/profile", function (req, res) {
  (async () => {
    try {
      console.log(await storage.getItem('auth_emp'));
      var options = {
        method: "POST",
        url: "http://dxktpipo.kaarcloud.com:50000/XISOAPAdapter/MessageServlet?senderParty=&senderService=BC_SK_EMPL&receiverParty=&receiverService=&interface=SI_SK_EMPL_PROFILE&interfaceNamespace=http://employeePortal_sk.com",
        headers: {
          "Content-Type": "application/soap+xml",
          SOAPAction:
            "urn:sap-com:document:sap:rfc:functions:ZFM_EMP_SK_PROFILE:ZFM_EMP_SK_PROFILE.Response",
          Authorization: "Basic cG91c2VyQDQ6MjAyMkBUZWNo",
          Cookie:
            "MYSAPSSO2=AjExMDAgAA9wb3J0YWw6cG91c2VyQDSIAAdkZWZhdWx0AQAIUE9VU0VSQDQCAAMwMDADAANLUE8EAAwyMDIzMDQxNDA1MjIFAAQAAAAICgAIUE9VU0VSQDT%2FAQUwggEBBgkqhkiG9w0BBwKggfMwgfACAQExCzAJBgUrDgMCGgUAMAsGCSqGSIb3DQEHATGB0DCBzQIBATAiMB0xDDAKBgNVBAMTA0tQTzENMAsGA1UECxMESjJFRQIBADAJBgUrDgMCGgUAoF0wGAYJKoZIhvcNAQkDMQsGCSqGSIb3DQEHATAcBgkqhkiG9w0BCQUxDxcNMjMwNDE0MDUyMjU3WjAjBgkqhkiG9w0BCQQxFgQURZSAX5oEDrA4Hv5AddplQQFVrK4wCQYHKoZIzjgEAwQvMC0CFQCWlJM77nOIZtR4qe%2Fw7ZCX%2Fz7pogIUUJpTLUSy15DZRafIUP1T4ilOyk4%3D; JSESSIONID=IGM_XK2i5Yvt8xiE-gKovDm5eTd-hwF-Y2kA_SAPjABWaybyn7tTXoVgCkVmeI6U; JSESSIONMARKID=v4K96Q_ECgldHKCl6oxa8g4azjHQNyQZEycX5jaQA; saplb_*=(J2EE6906720)6906750",
        },
        body:
          '<soapenv:Envelope xmlns:soapenv="http://schemas.xmlsoap.org/soap/envelope/" xmlns:urn="urn:sap-com:document:sap:rfc:functions">\r\n   <soapenv:Header/>\r\n   <soapenv:Body>\r\n      <urn:ZFM_EMP_SK_PROFILE>\r\n         <P_EMPLOYEE_ID>' +
        await  storage.getItem("auth_emp") +
          "</P_EMPLOYEE_ID>\r\n      </urn:ZFM_EMP_SK_PROFILE>\r\n   </soapenv:Body>\r\n</soapenv:Envelope>",
      };
      request(options, function (error, response) {
        if (error) throw new Error(error);
        var data = new xml();
        var xmljs = data.xml2js(response.body);
        xmljs = JSON.stringify(xmljs);
        res.send(xmljs);
      });
    } catch (err) {
      console.error('Error retrieving data:', err);
    }
  })();
 
});

app.get("/employee/logout", function (req, res) {
  (async () => {
    try {
     await storage.removeItem("auth_emp");
      console.log(storage.getItem("auth_emp"), "logout");
      res.send("Logged out successfully");
    } catch (err) {
      console.error('Error retrieving data:', err);
    }
  })();
  
});

app.post("/getDetails", function (req, response) {
  const data = req.body;
  const fields = [
    { label: "Employee ID", value: "EmployeeId" },
    { label: "Absence Type", value: "AbsenceType" },
    { label: "Reason For Absence", value: "ReasonForAbsence" },
    { label: "From Date", value: "FromDate" },
    { label: "To Date", value: "ToDate" },
    { label: "Absence Days", value: "AbsenceDays" },
    { label: "Absence Hour", value: "AbsenceHour" },
  ];
  const convertDataToHtml = (data, fields) => {
    const headerHtml = fields
      .map(
        (field) =>
          `<th style="background-color: #343541; color: white; padding: 8px;border :1px solid white">${field.label}</th>`
      )
      .join("");
    const bodyHtml = data
      .map(
        (item) =>
          `<tr>${fields
            .map(
              (field) =>
                `<td style="border: 1px solid #000; padding: 8px;">${
                  item[field.value]
                }</td>`
            )
            .join("")}</tr>`
      )
      .join("");
    const tableHtml = `<table style="width: 100%; border-collapse: collapse;">${headerHtml}${bodyHtml}</table>`;
    return `<h1 style="text-align: center;">Employee Leave Data</h1>${tableHtml}`; // Add heading above the table
  };
  const html = convertDataToHtml(data, fields);
  fs.writeFileSync("table.html", html, "utf-8");
  const options = {
    format: "Letter",
    orientation: "portrait",
    border: {
      top: "1px",
      right: "1px",
      bottom: "1px",
      left: "1px",
    },
  };
  let sendEmailCheck = false;
  pdf
    .create(fs.readFileSync("table.html", "utf-8"), options)
    .toFile("report.pdf", (err, res) => {
      if (err) {
        console.error(err);
        sendEmailCheck = false;
      } else {
        const pdfFilePath = "report.pdf";
        const pdfData = fs.readFileSync(pdfFilePath);
        const transporter = nodemailer.createTransport({
          host: "smtp.gmail.com",
          port: 587,
          secure: false,
          auth: {
            user: "srikanthlakshmi8@gmail.com",
            pass: "vcvyykohpsculnqd",
          },
        });

        transporter.sendMail(
          {
            from: "srikanthlakshmi8@gmail.com",
            to: "srikanthnishanth9025@gmail.com",
            subject: "Leave Request Report",
            attachments: [
              {
                filename: "report.pdf",
                content: pdfData,
              },
            ],
          },
          (error, info) => {
            if (error) {
              console.error("Failed to send email:", error);
              response.status(500).json({ message: "Failed to send email" });
            } else {
              console.log("Email sent successfully:", info);
              sendEmailCheck = true;
              // Send success response
              response.status(200).json({ message: "Email sent successfully" });
            }
          }
        );
      }
    });
});

 
 

 
 
const leaveRequests = [];
app.post("/SendLeaveRequest", (req, res) => {
  const { employeeId, leaveType, fromDate, toDate, reason } = req.body;
  const leaveRequestData = {
    employeeId,
    leaveType,
    fromDate,
    toDate,
    reason,
  };
  leaveRequests.push(leaveRequestData);

  res.status(200).json(leaveRequests);
});
app.get("/FetchleaveRequests", (req, res) => {
  console.log(leaveRequests);
  res.status(200).json(leaveRequests);
});
const port = process.env.PORT || 3030;

app.listen(port, () => {
  console.log("server listening on 3030");
});
