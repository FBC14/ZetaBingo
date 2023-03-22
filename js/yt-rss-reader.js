// XML feed for latest 15 uploads from a channel
// inspired by https://stackoverflow.com/questions/22613903/youtube-api-v3-get-list-of-users-videos
// and https://stackoverflow.com/questions/26531907/parse-xml-using-google-apps-script

// Example Channel
// https://www.youtube.com/feeds/videos.xml?channel_id=UCpJtk0myFr5WnyfsmnInP-w
const RSS_CHANNEL_URL = 'https://www.youtube.com/feeds/videos.xml?channel_id=';

// Playlist
// https://www.youtube.com/feeds/videos.xml?playlist_id=PLn786wm_GLgBWn_S_VSDHEdQO6rkSMw0V
const RSS_PLAYLIST_URL = 'https://www.youtube.com/feeds/videos.xml?playlist_id=';

function getVideosXml(channelId) {
  var url = RSS_CHANNEL_URL+channelId;
  var response = UrlFetchApp.fetch(url);
  var xml = response.getContentText();
  
  var document = XmlService.parse(xml);
  var root = document.getRootElement();
  
  // for xlmns
  var atom = XmlService.getNamespace('http://www.w3.org/2005/Atom');
  // for xlmns:media
  var media = XmlService.getNamespace('http://search.yahoo.com/mrss/');
  // for xlmns:yt
  var yt = XmlService.getNamespace('http://www.youtube.com/xml/schemas/2015');
  
  var channelId = root.getChild('channelId',yt).getText();
  var author = root.getChild('author',atom);
  var channelName = author.getChild('name',atom).getText();
  channelName = escapeQuotes(channelName);
  var channelUrl = author.getChild('uri',atom).getText();
  var channelCreated = root.getChild('published',atom).getText();
  
  var entries = root.getChildren('entry',atom);
  
  var latestVid = null;
  var videoId = null;
  var videoTitle = null;
  var videoPublishDate = null;
  
  var mediaGroup = null;
  var thumbObject = null;
  
  var latestVidObject = null;
  
  if (entries.length > 0){
    latestVid = entries[0];
    videoId = latestVid.getChild('videoId',yt).getText();
    videoTitle = latestVid.getChild('title',atom).getText();
    videoTitle = escapeQuotes(videoTitle);
    videoPublishDate = latestVid.getChild('published',atom).getText();
    
    mediaGroup = latestVid.getChild('group',media);
    var views = mediaGroup.getChild('community',media).getChild('statistics',media).getAttribute('views').getValue();
    
    var thumbUrl = mediaGroup.getChild('thumbnail',media).getAttribute('url').getValue();
    var thumbWidth = mediaGroup.getChild('thumbnail',media).getAttribute('width').getValue();
    var thumbHeight = mediaGroup.getChild('thumbnail',media).getAttribute('height').getValue();
    
    thumbObject = {
      url:thumbUrl,
      width:thumbWidth,
      height:thumbHeight
    };
    
    latestVidObject = {
      id:videoId,
      title: videoTitle,
      publishedAt: videoPublishDate,
      views:views,
      thumbnail: thumbObject
    };
  }
  
  
  var resultObject = {
    channel: {
      id: channelId,
      name: channelName,
      url: channelUrl
    },
    latestVideo: latestVidObject
  };
  
  return resultObject;
}


function parseYtId(id){
//  const channelIdLength = 24;
//  const videoIdLength = 11;
  var idArray = id.split(':');
  return idArray[2];
}

function escapeQuotes(text){
  if(text.indexOf('"') > -1){
    while(text.indexOf('"') > -1){
        text = text.replace('"', '!#quot;!');
    }
    while(text.indexOf('!#quot;!') > -1){
        text = text.replace('!#quot;!', '""');
    }
  }
  return text;
}

function testXmlReader(){
  var res = getVideosXml('UC9QnAjC7mT4ggHuedr1_kqQ');
  console.log(res.latestVideo.thumbnail.url);
  console.log(res.latestVideo.views);
  console.log(res.latestVideo.title);
}