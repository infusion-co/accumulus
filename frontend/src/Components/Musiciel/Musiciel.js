import React, { useState } from 'react';

import Textfield from '@material-ui/core/Textfield';

import { fetchRequest } from 'utils/helpers';
import './style.css';
import Musicumulus from 'Components/Cumulus/Musicumulus';
import { AirGuitar } from 'Components/AirGuitar';

const cloudBaseWidth = 150;
const cloudHeight = cloudBaseWidth / 3 + (cloudBaseWidth * 35) / 150;
const chuteMax = window.innerHeight;
const deriveMax = window.innerWidth - cloudBaseWidth;

const verticalspace = 1.8 * cloudHeight;

const chords = [
  { chordAltitude: chuteMax - cloudHeight, leftNote: 'Ricochet', rightNote: 'Simulacre' },
  { chordAltitude: chuteMax - verticalspace - cloudHeight, leftNote: 'Fantome', rightNote: 'Mur' },
  { chordAltitude: chuteMax - 2 * verticalspace - cloudHeight, leftNote: 'Calme', rightNote: 'Vent' },
  { chordAltitude: chuteMax - 3 * verticalspace - cloudHeight, leftNote: 'Machicoulis', rightNote: 'Vitre' },
];

let cloudId = 0;

const Musiciel = () => {
  // const [clouds, setClouds] = useState(['age', 'cage', 'rage', 'duage', 'hommage']);
  const [clouds, setClouds] = useState([]);
  const [nuageName, setNuageName] = useState('');
  const [hasAlreadyDrawn, setHasAlreadyDrawn] = useState(false);

  const addCloud = nuageName => {
    const l = [...clouds, nuageName];
    setClouds(l);
    setNuageName('');
  };

  const dessineLeNuage = async event => {
    event.preventDefault();
    var nuageNameLowerCase = nuageName.split(' ')[0].toLocaleLowerCase();

    const body = {
      word: nuageNameLowerCase,
      chords,
    };
    try {
      const response = await fetchRequest('http://127.0.0.1:5000/word_music_sheet', 'POST', body);
      const sheet = await response.json();
      console.log(sheet);
      addCloud({ name: nuageNameLowerCase, sheet, id: cloudId });
    } catch {
      addCloud({
        name: nuageNameLowerCase,
        id: cloudId,
        sheet: chords.map(({ chordAltitude, leftNote, rightNote }) => ({
          chordAltitude,
          leftNote,
          rightNote,
          note: Math.random(),
        })),
      });
    }
    cloudId += 1;
    setHasAlreadyDrawn(true);
  };

  const handleSkyLanding = cloudId => () => {
    const l = clouds.filter(cloud => cloud.id !== cloudId);
    setClouds(l);
  };
  return (
    <div className="ciel">
      {clouds.map(cloud => (
        <Musicumulus
          key={cloud.id}
          nuageName={cloud.name}
          musicSheet={cloud.sheet}
          deriveMax={deriveMax}
          handleSkyLanding={handleSkyLanding(cloud.id)}
        />
      ))}
      <AirGuitar chords={chords} />
      <div className="superficiel">
        <form onSubmit={dessineLeNuage} className="dessinage">
          <Textfield
            onChange={event => {
              setNuageName(event.target.value);
            }}
            value={nuageName}
            placeholder={clouds.length === 0 && !hasAlreadyDrawn ? 'Nommage' : null}
          />
        </form>
      </div>
    </div>
  );
};

export default Musiciel;