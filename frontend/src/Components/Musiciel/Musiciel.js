import React, { useState, useEffect } from 'react';
import sockeIOClient from 'socket.io-client';
import Tone from 'tone';
import styled from 'styled-components';

import Textfield from '@material-ui/core/TextField';

import { fetchRequest } from '../../utils/helpers';
import './style.css';
import Musicumulus from '../Cumulus/Musicumulus';
import { AirGuitar } from '../AirGuitar';
import { API_GATEWAY_URL, API_GATEWAY_PATH, AIR_GUITAR_OFFSET } from 'utils/constants';
import makePiece, { generateRandomSequence } from '../../helpers/generator';
import { pentaMinor } from '../../helpers/generator';
import { addPattern } from '../../helpers/generator';
import WanderingCumulus from 'Components/Cumulus/WanderingCumulus';
import { random } from 'utils/helpers';

const headerHeight = 50;
export const cloudBaseWidth = 150;
const chuteMax = window.innerHeight - 10;
const cloudHeight = Math.round(cloudBaseWidth / 3 + (cloudBaseWidth * 35) / 150);
const wanderingScaleFactor = 1 / 3.5;
const uploadedScaleFactor = 1 / 3.5;

const musicSheetHeight = Math.round(window.innerHeight * (1 - wanderingScaleFactor - uploadedScaleFactor));
const wanderingHeight = Math.round(window.innerHeight * wanderingScaleFactor * 0.8);
const uploadedHeight = Math.round(window.innerHeight * uploadedScaleFactor);
export const deriveMax = window.innerWidth - cloudBaseWidth;
const verticalspace = Math.round((musicSheetHeight - headerHeight) / 2.5);

const REPLACEMENT_THRESHOLD = 0.4;
const OPTIMAL_GAP_THRESHOLD = 0.15;

export const backgrounds = ['#F8B195', '#F67280', '#C06C84', '#355C7D'];

const initialPos = sheet => {
  return { x: sheet[0].note * (deriveMax - AIR_GUITAR_OFFSET) + AIR_GUITAR_OFFSET, y: chuteMax };
};

const getChordsFromWords = words =>
  words.map((wordPair, index) => {
    return {
      chordAltitude: musicSheetHeight + uploadedHeight - index * verticalspace,
      leftNote: wordPair.left,
      rightNote: wordPair.right,
      color: wordPair.color,
    };
  });

const Musiciel = ({ location: { search } }) => {
  const [cloudId, setCloudId] = useState(0);
  const [clouds, setClouds] = useState([]);
  const [uploadedClouds, setUploadedClouds] = useState([]);
  const [pentaKey, setPentaKey] = useState('F');
  const [musicloud, setMusicloud] = useState(null);
  const [nuageName, setNuageName] = useState('');
  const [hasAlreadyDrawn, setHasAlreadyDrawn] = useState(false);
  const [targets, setTargets] = useState([Math.random(), Math.random(), Math.random(), Math.random()]);
  const [words, setWords] = useState([
    { left: 'charrue', right: 'sapin', color: 'white' },
    { left: 'flibustier', right: 'verrou', color: 'white' },
    { left: 'machicoulis', right: 'fantôme', color: 'white' },
    { left: 'tennis', right: 'coquelicot', color: 'white' },
  ]);

  const chords = getChordsFromWords(words);

  const createMusiCloud = (id, name, sheet, initialPos, baseWidth) => {
    const cloud = {
      id,
      name,
      sheet,
      initialPos,
      baseWidth,
      isOptimal: false,
    };
    const closeWords = [];
    let optimalPath = 0;
    sheet.forEach((chord, index) => {
      if (chord.leftSim > REPLACEMENT_THRESHOLD) {
        closeWords.push({ x: 30, y: chord.chordAltitude, index, pos: 'left', background: backgrounds[index] });
      }
      if (chord.rightSim > REPLACEMENT_THRESHOLD) {
        closeWords.push({
          x: deriveMax - 30,
          y: chord.chordAltitude,
          index,
          pos: 'right',
          background: backgrounds[index],
        });
      }
      if (Math.abs(chord.note - targets[index]) < OPTIMAL_GAP_THRESHOLD) {
        optimalPath += 1;
      }
    });
    if (closeWords.length > 0) {
      cloud.replacementPos = closeWords[Math.floor(Math.random() * closeWords.length)];
    }
    if (optimalPath > 1) {
      cloud.isOptimal = true;
    }
    return cloud;
  };

  const createRandomSheet = () => {
    return chords.map(({ chordAltitude, leftNote, rightNote }) => ({
      chordAltitude,
      leftNote,
      rightNote,
      note: Math.random(),
    }));
  };

  const getBaseWidth = () => {
    return Math.max(Math.round(random(100, 180)), nuageName.length * 12);
  };

  // const urlParam = new URLSearchParams(search);
  // console.log(urlParam.get('all'));
  React.useEffect(() => {
    /*makePiece(pentaMinor[pentaKey]).then(cleanUp => {
      Tone.Transport.start();
    });*/
    const pattern = `Drums${Math.ceil(Math.random() * 4)}`;
    const bass = `Bass${Math.ceil(Math.random() * 4)}`;
    const chord = `Chords${Math.ceil(Math.random() * 4)}`;
    const melody = `Melodies${Math.ceil(Math.random() * 4)}`;

    // console.log('add pattern');
    // addPattern(null, pattern);
    // addPattern(null, bass);
    // addPattern(null, chord);
    // addPattern(null, melody);

    // Tone.Transport.start();
  }, [pentaKey]);

  const switchKey = key =>
    new Promise(resolve => {
      Tone.Transport.stop();
      Tone.Transport.cancel();
      resolve();
    }).then(() => setPentaKey(key));

  const addCloud = newCloud => {
    const l = [...clouds, newCloud];
    setClouds(l);
  };

  const getMusicSheet = async (word, chords) => {
    try {
      const response = await fetchRequest('http://127.0.0.1:5000/word_music_sheet', 'POST', { word, chords });
      const sheet = await response.json();
      return sheet;
    } catch {
      return createRandomSheet();
    }
  };

  // receive clouds from other skies
  useEffect(() => {
    const socket = sockeIOClient(API_GATEWAY_URL, { path: API_GATEWAY_PATH });
    socket.on('upload', async upcomingClouds => {
      if (upcomingClouds.length === 0) return;
      let musicloudOffset = 0;
      const upcomingCloudsSize = upcomingClouds.length;
      if (musicloud === null) {
        const newMusicloudName = upcomingClouds.shift();
        const sheet = await getMusicSheet(newMusicloudName, chords);
        const baseWidth = getBaseWidth();
        setMusicloud(createMusiCloud(cloudId, newMusicloudName, sheet, initialPos(sheet), baseWidth));
        musicloudOffset += 1;
      }

      for (let index = 0; index < upcomingClouds.length; index++) {
        const baseWidth = getBaseWidth();
        clouds.push({ id: cloudId + musicloudOffset + index, name: upcomingClouds[index], baseWidth });
      }
      setClouds(clouds);
      setCloudId(cloudId + upcomingCloudsSize);
    });
    return () => {
      socket.close();
    };
  }, [clouds, cloudId, musicloud]);

  const dessineLeNuage = async event => {
    event.preventDefault();
    var nuageNameLowerCase = nuageName.split(' ')[0].toLocaleLowerCase();

    const baseWidth = getBaseWidth();
    if (musicloud === null) {
      const sheet = await getMusicSheet(nuageNameLowerCase, chords);
      setMusicloud(createMusiCloud(cloudId, nuageNameLowerCase, sheet, initialPos(sheet), baseWidth));
    } else {
      addCloud({ id: cloudId, name: nuageNameLowerCase, baseWidth });
    }
    setNuageName('');
    setHasAlreadyDrawn(true);
    setCloudId(cloudId + 1);
  };

  const handleSkyLanding = async () => {
    let uploadedCloudName = musicloud.name;
    if (musicloud.replacementPos) {
      const wordToUpdate = words[musicloud.replacementPos.index];
      uploadedCloudName = words[musicloud.replacementPos.index][musicloud.replacementPos.pos];
      words[musicloud.replacementPos.index] = { ...wordToUpdate, [musicloud.replacementPos.pos]: musicloud.name };
      setWords(words);
    }
    if (musicloud.isOptimal) {
      setTargets([Math.random(), Math.random(), Math.random(), Math.random()]);
    }

    const uploadedCloud = musicloud;
    if (!(musicloud.replacementPos && musicloud.name === uploadedCloudName)) {
      uploadedCloud.initialPos = {
        x: document.getElementById(uploadedCloud.id).getBoundingClientRect().x,
        y: document.getElementById(uploadedCloud.id).getBoundingClientRect().y,
      };
      uploadedCloud.name = uploadedCloudName;
      const newUploadedCloudsList = [...uploadedClouds, uploadedCloud];
      setUploadedClouds(newUploadedCloudsList);
    }
    if (clouds.length === 0) return setMusicloud(null);

    const initialPos = {
      x: document.getElementById(clouds[0].id).getBoundingClientRect().x,
      y: document.getElementById(clouds[0].id).getBoundingClientRect().y,
    };
    const newMusicloud = clouds[0];
    const newChords = getChordsFromWords(words);
    const sheet = await getMusicSheet(newMusicloud.name, newChords);
    setMusicloud(createMusiCloud(newMusicloud.id, newMusicloud.name, sheet, initialPos, newMusicloud.baseWidth));

    const newClouds = clouds.splice(1);
    setClouds(newClouds);
  };
  return (
    <div className="ciel">
      {clouds.map(cloud => (
        <WanderingCumulus
          cloudId={cloud.id}
          key={cloud.id}
          nuageName={cloud.name}
          baseWidth={cloud.baseWidth}
          cloudHeight={cloudHeight}
          meanHeight={uploadedHeight + musicSheetHeight + cloudHeight + wanderingHeight / 2}
          wanderingHeight={wanderingHeight * 0.8}
          style={{ opacity: 0.6 }}
        />
      ))}
      <AirGuitar targets={targets} chords={chords} baseWidth={cloudBaseWidth} />
      {musicloud && (
        <Musicumulus
          cloudId={musicloud.id}
          key={musicloud.id}
          pentaKey={pentaKey}
          initialPos={musicloud.initialPos}
          deriveMax={deriveMax}
          nuageName={musicloud.name}
          musicSheet={musicloud.sheet}
          baseWidth={musicloud.baseWidth}
          isOptimal={musicloud.isOptimal}
          handleSkyLanding={handleSkyLanding}
          style={{ opacity: 0.9 }}
          replacementPos={musicloud.replacementPos}
        />
      )}
      {uploadedClouds.map(cloud => (
        <WanderingCumulus
          cloudId={cloud.id}
          key={cloud.id}
          nuageName={cloud.name}
          baseWidth={cloud.baseWidth}
          initialPos={cloud.initialPos}
          cloudHeight={cloudHeight}
          meanHeight={uploadedHeight / 2}
          wanderingHeight={uploadedHeight - cloudHeight}
          style={{ opacity: 0.5 }}
          isOptimal={cloud.isOptimal}
        />
      ))}
      <div className="superficiel">
        <form onSubmit={dessineLeNuage} className="dessinage">
          <Textfield
            // style={{ color: 'lightgray' }}
            onChange={event => {
              setNuageName(event.target.value);
            }}
            value={nuageName}
            placeholder={clouds.length === 0 && !hasAlreadyDrawn ? 'Nommage' : null}
          />
          <div className="ambiancage">
            {Object.keys(pentaMinor).map(key => (
              <KeyButton selected={key === pentaKey} type="button" onClick={() => switchKey(key)}>
                {key}
              </KeyButton>
            ))}
          </div>
        </form>
      </div>
    </div>
  );
};

const KeyButton = styled.button`
  background: none;
  border: none;
  outline: none;
  cursor: pointer;
  color: lightgray;
  text-decoration: ${props => (props.selected ? 'underline' : 'none')};
`;

export default Musiciel;
