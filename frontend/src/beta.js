import { Component, createRef, useState, useRef } from 'react';
import { toPx, percentToPx } from './helpers';
import styles from './style';
import { useDivCenter } from './hooks';

function BetaDashboard(props) {
  return (
    <div className='beta-dashboard'>
      <h1>Beta</h1>
      {props.beta.map(({ _id, holds }, index) => <BetaCard id={_id} key={_id} onClick={props.handleBetaClick} />)}
    </div>
    )
}

function BetaCard(props) {
  return (
    <div
      className='beta-card'
      id={props.id}
      onClick={props.onClick} >
      <span>{props.id}</span>
    </div>
    )
}

function Beta(props) {
  return (
    props.holds.map(({ _id, type, coordinates }) => {
      const coords = percentToPx(coordinates.x, coordinates.y, props.imageDimensions.x, props.imageDimensions.y);
      return <BetaNode
                coordinates={coords}
                type={type}
                key={_id} />
                })
              )
            }

function BetaNode(props) {
  const div = useRef();
  const center = useDivCenter(div, props.coordinates);

  const [hovered, setHovered] = useState(false);

  const style = () => {
    let style = {
      left:toPx(center.x),
      top:toPx(center.y)
    };
    style.borderColor = props.type.split('-')[0] === 'foot' ? styles.betaColor.foot : styles.betaColor.hand;
    style.opacity = hovered ? styles.opacity.hovered : styles.opacity.notHovered;
    return style
  }

  return (
    <div
      ref={div}
      className='hold'
      style={style()}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)} >
    </div>
    )
}

export { BetaDashboard, Beta }
