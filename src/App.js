import React, { createRef, useEffect, useState } from 'react'
import {ReplyIcon, RetweetIcon, LikeIcon, ShareIcon, VerifiedIcon} from './icons'
import './style.scss';
import { AvatarLoader } from './Loader';
import html2canvas  from 'html2canvas';
import { language } from './language';

function convertImgToBase64(url, callback, outputFormat) {
  var canvas = document.createElement('CANVAS');
  var ctx = canvas.getContext('2d');
  var img = new Image();
  img.crossOrigin = 'Anonymous';
  img.onload = function() {
    canvas.height = img.height;
    canvas.width = img.width;
    ctx.drawImage(img, 0, 0);
    var dataURL = canvas.toDataURL(outputFormat || 'image/png');
    callback.call(this, dataURL);
    // Clean up
    canvas = null;
  };
  img.src = url;
}

const tweetFormat = tweet => {
  tweet = tweet
  .replace(/@([\w]+)/g, '<span>@$1</span>')
  .replace(/#([\wşçöğüıİ]+)/gi, '<span>#$1</span>')
  .replace(/@(https?:\/\/[\w\.\/]+)/, '<span>$1</span>')
  .replace(/\n/g, '<br />');
  return tweet;
};

const formatNumber = number => {
     if(!number){
      number=0
     }
     if(number < 1000){
      return number;
     }
     number /= 1000;
     number = String(number).split('.');

     return(
      number[0] + (number[1] > 100 ? ',' + number[1].slice(0,1) + 'B' : 'B')
     );
};

export default function App() {

  const tweetRef = createRef(null);
  const downloadRef = createRef();
  const [name, setName] = useState();
  const [username, setUsername] = useState();
  const [isVerified, setIsVerified] = useState(0);
  const [tweet, setTweet] = useState();
  const [avatar, setAvatar] = useState();
  const [retweets, setRetweets] = useState(0);
  const [quoteTweets, setQuoateTweets] = useState(0);
  const [likes, setLikes] = useState(0);
  const [lang, setLang] = useState('tr');
  const [langText, setLangText] = useState();
  const [image, setImage] = useState(null);

  const takeScreenshot = () => {
    html2canvas(tweetRef.current).then((canvas) => {
      const img = canvas.toDataURL();  
      setImage(img);
    });
  };
  
  useEffect(() => {
    if(image) {
      downloadRef.current.click();
    }
  }, [image])

  useEffect(() => {
    setLangText(language[lang]);
  },[lang]);

  const avatarHandle = (event) => {
    const file = event.target.files[0];
    const reader = new FileReader();
    reader.onload = function (e) {
      setAvatar(e.target.result); // Set base64 data URL
    };
    reader.readAsDataURL(file);
  };

  const fetchTwitterInfo = () => {
    fetch(`https://typeahead-js-twitter-api-proxy.herokuapp.com/demo/search?q=${username}`)

    .then(res => res.json())
    .then(data => {
      const twitter = data[0];
      console.log(twitter)

      convertImgToBase64(twitter.profile_image_url_https, function(
        base64Image
      ) {
          setAvatar(base64Image);
        });
        
        setName(twitter.name);
        setUsername(twitter.screen_name);
        setTweet(twitter.status.text);
        setRetweets(tweet.status.retweet_count);
        setLikes(twitter.status.favorite_count);
    });
  };

  return (
    <div className='main-container'>

      <div className='tweet-settings'>
        <h3>{langText?.settings}</h3>
        <ul>
          <li>
            <label>{langText?.name}</label>
            <input
              type='text' className='input' value={name}
              onChange={e => setName(e.target.value)}
            />
          </li>
          <li>
            <label>{langText?.username}</label>
            <input
              type='text' className='input' value={username}
              onChange={e => setUsername(e.target.value)}
            />
          </li>
          <li>
            <label>Tweet</label>
            <textarea
              type='text' className='input' value={tweet}
              onChange={e => setTweet(e.target.value)}
            />
          </li>
          <li>
            <label>Avatar</label>
            <input
              type='file' className='input' onChange={avatarHandle}
            />
          </li>
          <li>
            <label>Retweet</label>
            <input
              type='number' className='input' value={retweets}
              onChange={e => setRetweets(e.target.value)}
            />
          </li>
          <li>
            <label>Alıntı Tweetler</label>
            <input
              type='number' className='input' value={quoteTweets}
              onChange={e => setQuoateTweets(e.target.value)}
            />
          </li>
          <li>
            <label>Beğeni</label>
            <input
              type='number' className='input' value={likes}
              onChange={e => setLikes(e.target.value)}
            />
          </li>
          <li>
            <label>Doğrulanmış Hesap</label>
            <select
              onChange={e => setIsVerified(e.target.value)}
              defaultValue={isVerified}
            >
                    <option value="1">Evet</option>
                    <option value="2">Hayır</option>
            </select>
            </li>
            <button onClick={takeScreenshot}>Oluştur</button>
            <div className='download-url'>
              { image && (
                <a ref={downloadRef} href={image} download="tweet.png">
                  Tweet İndir
                </a>
              )
              }

            </div>
        </ul>
      </div>
      
      <div className='tweet-container'>

        <div className='app-language'>
          <span onClick={() => setLang('tr')}
            className={lang === 'tr' && 'active'}>
              Türkçe
          </span>
          <span onClick={() => setLang('en')}
            className={lang === 'en' && 'active'}>
              English
          </span>
        </div>

        <div className='fetch-info'>
          <input
          type='text'
          value={username}
          placeholder='Twitter Kullanıcı Adını Yazın'
          onChange={e => setUsername(e.target.value)}
          />
          <button onClick={fetchTwitterInfo}>Bilgileri Çek</button>
        </div>

        <div className='tweet' ref={tweetRef}>

          <div className='tweet-author'>
            {(avatar && <img src={avatar}/> || <AvatarLoader/>)}
            <div>
              <div className='name'>
                <span>{name || 'Ad Soyad'}</span>
                {isVerified == 1 && <VerifiedIcon width="19" height="19" />}
              </div>
              <div className='username'>@{username || 'kullaniciadi'}</div>
            </div>
          </div>
          <div className='tweet-content'>
          <p
              dangerouslySetInnerHTML={{
                __html:
                  (tweet && tweetFormat(tweet)) ||
                  'Bu alana örnek tweet gelecek'
              }}
            />
          </div>

          <div className='tweet-stats'>
            <span>
              <b>{formatNumber(retweets)}</b> Retweet
            </span>
            <span>
              <b>{formatNumber(quoteTweets)}</b> Alıntı Tweetler
            </span>
            <span>
              <b>{formatNumber(likes)}</b> Beğeni
            </span>
          </div>

          <div className='tweet-actions'>
            <span>
              <ReplyIcon/>
            </span>
            <span>
              <RetweetIcon/>
            </span>
            <span>
              <LikeIcon/>
            </span>
            <span>
              <ShareIcon/>
            </span>
          </div>

        </div>
      </div>
    </div>

  )
}
