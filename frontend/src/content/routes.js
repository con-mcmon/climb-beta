import churningInTheWake from './images/churning-in-the-wake.jpg';
import churningInTheWakeCrux from './images/churning-in-the-wake_crux.jpg';

const routes = {
  churningInTheWake: {
    image: churningInTheWake,
    alt: 'churning in the wake',
    crux: [
    {
      coords: {x:45, y:15},
      image: churningInTheWakeCrux,
      alt: 'churning in the wake crux'
    },
    {
      coords: {x:50, y:50},
      image: churningInTheWakeCrux,
      alt: 'churning in the wake crux'
    },
    ]
  }
}

export default routes;
