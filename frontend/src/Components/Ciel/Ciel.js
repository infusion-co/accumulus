import React, { useState, useEffect } from 'react';
import sockeIOClient from 'socket.io-client';

import TextField from '@material-ui/core/TextField';
import IconButton from '@material-ui/core/IconButton';
import Tooltip from '@material-ui/core/Tooltip';

import { fetchRequest } from 'utils/helpers';
import UploadLogo from 'icons/upload.png';
import RainLogo from 'icons/rain.png';

import Cumulus from '../Cumulus/Cumulus';
import './style.css';
import { API_BASE_URL, API_GATEWAY_PATH, API_NUAGE_PATH, GATEWAY_SOCKET_PATH } from 'utils/constants';

import Switch from '@material-ui/core/Switch';
// const rimages = require('utils/dictionnage.json');

const rimeWith = (word, suffixe) => {
  const preRime = word.split(suffixe);
  return preRime.length > 1 && preRime[preRime.length - 1] === '';
};

const nuagesToCloud = (name, clouds) => {
  const url = `${API_BASE_URL}/accumulus`;
  const body = { name, nuages: clouds };
  fetchRequest(url, 'POST', body);
};

const socket = sockeIOClient(API_GATEWAY_URL, { path: API_GATEWAY_PATH });

const Ciel = ({ cloud9 }) => {
  // const [clouds, setClouds] = useState(['age', 'cage', 'rage', 'duage', 'hommage']);
  const [clouds, setClouds] = useState([]);
  const [nuageName, setNuageName] = useState('');
  const [upload, setUpload] = useState(false);
  const [hasAlreadyDrawn, setHasAlreadyDrawn] = useState(false);
  const [cloudsLandedCount, setCloudsLandedCount] = useState(0);
  const [cloudsRainedCount, setCloudsRainedCount] = useState(0);
  const [isRaining, makeItRain] = useState(false);
  const [autoUpload, setAutoUpload] = useState(true);

  const addCloud = nuageName => {
    const l = [...clouds, nuageName];
    setClouds(l);
    setNuageName('');
    return l;
  };

  const handleUpload = autoUploadList => {
    let uploadClouds = autoUploadList || clouds;

    if (uploadClouds.length === 0 && nuageName) {
      uploadClouds = addCloud(nuageName);
    }
    if (uploadClouds.length === 0) {
      // eslint-disable-next-line no-alert
      alert('Pas de nuage en partance pour le voyage. Trouve un nommage');
    }
    if (uploadClouds.length > 0 && !upload) {
      nuagesToCloud('envoyage', uploadClouds);
      setUpload(true);
      setHasAlreadyDrawn(true);
    }
  };

  const dessineLeNuage = event => {
    event.preventDefault();
    var nuageNameLowerCase = nuageName.split(' ')[0].toLocaleLowerCase();
    // if (!rimeWith(nuageNameLowerCase, 'age') && !rimeWith(nuageNameLowerCase, 'âge')) {
    //   // eslint-disable-next-line no-alert
    //   alert('Ce mot ne rime pas avec nuage');
    //   return;
    // }

    if (nuageNameLowerCase.charAt(nuageNameLowerCase.length - 1) === ' ') {
      nuageNameLowerCase = nuageNameLowerCase.slice(0, -1);
    }

    const autoUploadList = addCloud(nuageNameLowerCase);
    if (autoUpload) {
      handleUpload(autoUploadList);
    }
  };

  const handleMakeItRain = () => {
    if (clouds.length === 0) {
      // eslint-disable-next-line no-alert
      alert('Pas de nuage dans les parages.');
      return;
    }
    nuagesToCloud('mouillage', clouds);
    makeItRain(true);
    setHasAlreadyDrawn(true);
  };

  useEffect(() => {
    if (upload && cloudsLandedCount >= clouds.length && clouds.length > 0) {
      setUpload(false);
      setCloudsLandedCount(0);
      if (!cloud9) socket.emit('upload', clouds);
      setClouds([]);
    }
  }, [cloudsLandedCount, upload, clouds]);

  const handleSkyLanding = () => {
    const count = cloudsLandedCount;
    setCloudsLandedCount(count + 1);
  };

  useEffect(() => {
    if (isRaining && cloudsRainedCount >= clouds.length && clouds.length > 0) {
      makeItRain(false);
      setCloudsRainedCount(0);
      setClouds([]);
    }
  }, [cloudsRainedCount, isRaining, clouds]);

  const handleRainOver = () => {
    const count = cloudsRainedCount;
    setCloudsRainedCount(count + 1);
  };

  return (
    <div className="ciel">
      {clouds.map(nuageName => {
        return (
          <Cumulus
            key={nuageName}
            nuageName={nuageName}
            upload={upload}
            handleSkyLanding={handleSkyLanding}
            handleRainOver={handleRainOver}
            isRaining={isRaining}
          />
        );
      })}
      <div className="superficiel">
        <form onSubmit={dessineLeNuage} className="ciel-dessinage">
          <TextField
            onChange={event => {
              setNuageName(event.target.value);
            }}
            value={nuageName}
            placeholder={clouds.length === 0 && !hasAlreadyDrawn ? 'Nuage' : null}
          />
        </form>
        <Tooltip title="Mouillage">
          <IconButton style={{ position: 'absolute', right: '45px', top: '10px' }} onClick={handleMakeItRain}>
            <img alt="" src={RainLogo} style={{ width: '25px', opacity: '0.9' }} />
          </IconButton>
        </Tooltip>
        <Tooltip title="Envoyage">
          <IconButton style={{ position: 'absolute', right: '10px', top: '10px' }} onClick={() => handleUpload()}>
            <img alt="" src={UploadLogo} style={{ width: '25px', opacity: '0.9' }} className={upload ? 'upload' : ''} />
          </IconButton>
        </Tooltip>
        <div
          style={{
            position: 'absolute',
            left: '10px',
            top: `${window.innerHeight - 50}px`,
            display: 'flex',
            alignItems: 'baseline',
          }}
        >
          <Switch color="primary" checked={autoUpload} onChange={() => setAutoUpload(!autoUpload)} value="checkedA" />
          <p style={{ color: 'white', fontSize: '14px' }}>Auto Upload</p>
        </div>
      </div>
    </div>
  );
};

export default Ciel;
