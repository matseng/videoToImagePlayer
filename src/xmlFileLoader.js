// adapted from: http://wpquestions.com/question/showChrono/id/8737

function xmlFileLoader(xmlfile)
  {
  var xmlDoc;
  var xmlloaded = false;
    try
    {
        var xmlhttp = new XMLHttpRequest();
        xmlhttp.open("GET", xmlfile, false);
    }
    catch (Exception)
    {
        var ie = (typeof window.ActiveXObject != 'undefined');

        if (ie)
        {
            xmlDoc = new ActiveXObject("Microsoft.XMLDOM");
            xmlDoc.async = false;
            while(xmlDoc.readyState != 4) {};
            xmlDoc.load(xmlfile);
            xmlloaded = true;
        }
        else
        {
            xmlDoc = document.implementation.createDocument("", "", null);
            xmlDoc.load(xmlfile);
            xmlloaded = true;
        }
    }

    if (!xmlloaded)
    {
        xmlhttp.setRequestHeader('Content-Type', 'text/xml');
      try {
        xmlhttp.send("");
      } catch (err) {
        console.log('Error: ' + err);
        return;
      }
        xmlDoc = xmlhttp.responseXML;
        if (!xmlDoc) {
          xmlDoc = xmlhttp.responseText;  // set to a text file not xml
        }
        xmlloaded = true;
    }
    return xmlDoc;
  }
