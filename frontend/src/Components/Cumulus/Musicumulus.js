import React, { useEffect, useState } from 'react';
import { TweenLite, TweenMax, Bounce, Power2 } from 'gsap/TweenMax';
import { random } from 'utils/helpers';
import { Nuage } from './Nuage';
import Tone from 'tone';
import './style.css';
import { playNote, addPattern, patterns } from '../../helpers/generator';
import { deriveMax, cloudBaseWidth } from 'Components/Musiciel/Musiciel';
import { AIR_GUITAR_OFFSET } from 'utils/constants';

const ableton = ['Drums2', 'Bass1', 'Chords3', 'Melodies4'];
const debug = false;
const Musicumulus = ({
  cloudId,
  handleSkyLanding,
  baseWidth,
  nuageName,
  musicSheet,
  initialPos,
  pentaKey,
  replacementPos,
  isOptimal,
}) => {
  // reference to the DOM node
  var cumulus = null;
  const volume = new Tone.Channel(-5).connect(Tone.Master);

  const [backgroundColor, setBackgroundColor] = useState('white');
  const [fontColor, setFontColor] = useState('black');

  const [isArrived, arrive] = useState(false);
  useEffect(() => {
    if (isArrived) handleSkyLanding();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isArrived]);

  useEffect(() => {
    TweenLite.set(cumulus, {
      x: initialPos.x,
      y: initialPos.y,
    });

    const blowUp = (cumulus, note) => {
      if (replacementPos) {
        setBackgroundColor(replacementPos.background);
        setFontColor('white');
      }

      TweenMax.to(cumulus, debug ? 0.1 : 5, {
        y: 100,
        // opacity: replacementPos ? 1 : 0,
        onStart: () => null, // playNote(note),
        onComplete: () =>
          new Promise(resolve => {
            if (isOptimal) {
              setBackgroundColor('yellow');
              setFontColor('black');
            }
            let hoveringAltitude = 60;
            const hoveringDeplacementTimeMillis = isOptimal ? 500 : 1000;
            const hoveringInterval = setInterval(() => {
              TweenMax.to(cumulus, hoveringDeplacementTimeMillis / 1000, {
                y: hoveringAltitude,
                ease: isOptimal ? Bounce.easeOut : Power2.easeOut,
              });
              hoveringAltitude = hoveringAltitude === 120 ? 60 : 120;
            }, hoveringDeplacementTimeMillis);

            const hoveringTime = isOptimal ? 5000 : 3000;
            setTimeout(
              () => {
                Tone.Transport.stop();
                Tone.Transport.cancel();
                let initialVolume = -10;
                const interval = setInterval(() => {
                  volume.volume.value = initialVolume;
                  initialVolume -= 0.25;
                }, 100);
                setTimeout(
                  () => {
                    clearInterval(hoveringInterval);
                    clearInterval(interval);
                    resolve(cumulus);
                  },
                  debug ? 50 : 1000,
                );
              },
              debug ? 10 : hoveringTime,
            );
          }).then(cumulus => {
            if (!replacementPos) {
              TweenMax.to(cumulus, debug ? 0.3 : 3, { opacity: 0, onComplete: () => arrive(true) });
            } else {
              TweenMax.to(cumulus, 2, {
                x: replacementPos.x,
                y: replacementPos.y,
                ease: Bounce.easeOut,
                onComplete: () => arrive(true),
              });
            }
          }),
      });
    };

    const twinTo = (index, cumulus) => () => {
      TweenMax.to(cumulus, debug ? 1 : random(1, 3), {
        x:
          musicSheet[index].note * (deriveMax - 2 * AIR_GUITAR_OFFSET - 2 * cloudBaseWidth) +
          AIR_GUITAR_OFFSET +
          cloudBaseWidth,
        y: musicSheet[index].chordAltitude,
        onStart: () => {
          if (index > 0) {
            // playNote(Math.floor(musicSheet[index].note * 7), pentaKey);
          }
        },
        onComplete: () => {
          if (index < musicSheet.length - 1) {
            addPattern(null, `${patterns[index]}${Math.ceil(musicSheet[index].note * 8)}`, volume).then(() => {
              twinTo(index + 1, cumulus)();
            });
          } else {
            addPattern(null, `${patterns[index]}${Math.ceil(musicSheet[index].note * 8)}`, volume).then(() => {
              blowUp(cumulus, null);
            });
          }
        },
        // ease: Power4.easeOut,
      });
    };

    twinTo(0, cumulus)();
  }, [cumulus]);

  return (
    <div id={cloudId} ref={div => (cumulus = div)} className="cumulus" style={{ opacity: 0.9 }}>
      <Nuage color={backgroundColor} fontColor={fontColor} nuageName={nuageName} baseWidth={baseWidth} />
    </div>
  );
};

export default Musicumulus;
