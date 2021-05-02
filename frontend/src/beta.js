import { useState, useEffect, useRef } from 'react';
import Slider from '@material-ui/core/Slider';
import axios from 'axios';
import { toPx, percentToPx } from './helpers';
import styles from './style';
import { useDivCenter, useUsername } from './hooks';

function BetaDashboard(props) {
  const [sortMethod, setSortMethod] = useState(null);
  const [sortedBeta, setSortedBeta] = useState(props.filteredBeta);

  useEffect(() => {
    if (sortMethod === null) {
      setSortedBeta(props.filteredBeta)
    } else if (sortMethod === 'holdNumber') {
      const holdNumberSort = props.filteredBeta.sort((a, b) => {
        const holdCountA = a.holds.length;
        const holdCountB = b.holds.length;

        if (holdCountA < holdCountB) return -1;
        if (holdCountA > holdCountB) return 1;
        else return 0;
      })
      setSortedBeta(holdNumberSort);
    }
    }, [sortMethod, props.filteredBeta])

  return (
    <div className='beta-dashboard'>
      <BetaList
        beta={sortedBeta}
        renderedBeta={props.renderedBeta}
        handleBetaClick={props.handleBetaCardClick}
        handleBetaMouseOver={props.handleBetaCardMouseOver} />
      <div className='beta-dashboard-content' >
        <div className='beta-dashboard-column'>
          <select onChange={(e) => setSortMethod(e.target.value)}>
            <option selected defaultValue disabled>Sort By</option>
            <option value='holdNumber'>No. of Holds</option>
          </select>
        </div>
        <BetaFilters
          beta={props.beta}
          filter={props.filterBeta} />
      </div>
      <button onClick={() => props.handleShowAllBetaClick()}>{props.allBetaRendered ? 'Hide All' : 'Show All'}</button>
    </div>
    )
}

function BetaList(props) {
  const rendered = (id) => {
    for (const beta of props.renderedBeta) {
      if (beta._id === id) {
        return true;
      }
    }
    return false;
  }

  return (
    <div className='beta-list' >
      Beta
      {props.beta.map(({ _id, holds, user }) => {
        return (
          <BetaCard
            id={_id}
            key={_id}
            userId={user}
            rendered={rendered(_id)}
            handleClick={props.handleBetaClick}
            handleMouseOver={props.handleBetaMouseOver} /> )
            }) }
    </div>
    )
}

function BetaCard(props) {
  const username = useUsername(props.userId);

  const [hovered, setHovered] = useState(false);
  function handleMouseOver(mouseInside) {
    setHovered(mouseInside);
    props.handleMouseOver(props.id, mouseInside);
  }

  const handleClick = () => props.handleClick(props.id);

  const style = () => {
    let style = {};
    if (props.rendered) {
      style.opacity = 1.0;
    }
    return style;
  }

  return (
    <div
      className='beta-card'
      id={props.id}
      onClick={handleClick}
      onMouseEnter={() => handleMouseOver(true)}
      onMouseLeave={() => handleMouseOver(false)}
      style={style()} >
      <p>{username}</p>
    </div>
    )
}

function BetaFilters(props) {
  //number of holds
  const holdNumbers = props.beta.map(({ holds }) => holds.length);
  const holdMin = Math.min(...holdNumbers);
  const holdMax = Math.max(...holdNumbers);
  const [holdRange, setHoldRange] = useState([holdMin, holdMax]);
  const handleHoldRangeSliderChange = (event, newValue) => {
    setHoldRange(newValue);
    props.filter('holdAmount', newValue)
  }

  return (
    <div className='beta-dashboard-column'>
      No. of Holds
      <Slider
        value={holdRange}
        min={holdMin}
        max={holdMax}
        onChange={handleHoldRangeSliderChange}
        valueLabelDisplay="auto"
        aria-labelledby="range-slider"/>
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
