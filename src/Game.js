import React, { Component } from 'react';
import Mousetrap from 'mousetrap';
import _ from 'lodash';

const ROW_COUNT = 4;
const COL_COUNT = 4;
const DIRECTIONS = [
  'UP',
  'DOWN',
  'LEFT',
  'RIGHT'
];
const VECTORS = {
  UP: [0, -1],
  DOWN: [0, 1],
  LEFT: [-1, 0],
  RIGHT: [1, 0]
};

function getRandomInt(max) {
  return Math.floor(Math.random() * Math.floor(max));
}

function getEmptyCells(matrix) {
  const addresses = [];
  _.map(matrix, (row, i) => {
    _.map(row, (cell, j) => {
      if (cell !== 0) {
        return;
      }
      addresses.push([i, j]);
    });
  });
  return addresses;
}

function getRandomEmptyCell(matrix) {
  const addresses = getEmptyCells(matrix);
  const index = getRandomInt(addresses.length);
  return addresses[index];
}

function setCellValue(matrix, address, value) {
  matrix[address[0]][address[1]] = value;
  return matrix;
}

function fillRandomEmptyCell(matrix) {
  const address = getRandomEmptyCell(matrix);
  const value = Math.random() < 0.9 ? 2 : 4;
  return setCellValue(matrix, address, value);
}

function createMatrix() {
  const matrix = [];
  for (let i = 0; i < ROW_COUNT; i++) {
    const row = [];
    for (let j = 0; j < COL_COUNT; j++) {
      row.push(0);
    }
    matrix.push(row);
  }
  fillRandomEmptyCell(matrix);
  fillRandomEmptyCell(matrix);
  return matrix;
}

function isValid(address) {
  return address[0] >= 0
    && address[0] < COL_COUNT
    && address[1] >= 0
    && address[1] < ROW_COUNT;
}

function isFarthest(address, direction) {
  const vector = VECTORS[direction];
  return !isValid([address[0] + vector[0], address[1] + vector[1]]);
}

function getFarthestFacet(direction) {
  const facet = [];
  for (let i = 0; i < COL_COUNT; i++) {
    for (let j = 0; j < ROW_COUNT; j++) {
      if (isFarthest([i, j], direction)) {
        facet.push([i, j]);
      }
    }
  }
  return facet;
}

function pushCell(matrix, address, direction) {
  if (isFarthest(address, direction)) {
    return false;
  }
  const value = matrix[address[0]][address[1]];
  if (value === 0) {
    return false;
  }
  const vector = VECTORS[direction];
  let currentAddress = address;
  let nextAddress = [address[0] + vector[0], address[1] + vector[1]];
  let nextValue = matrix[nextAddress[0]][nextAddress[1]];
  while (nextValue === 0 && !isFarthest(nextAddress, direction)) {
    matrix[currentAddress[0]][currentAddress[1]] = 0;
    matrix[nextAddress[0]][nextAddress[1]] = value;
    currentAddress = nextAddress;
    nextAddress = [nextAddress[0] + vector[0], nextAddress[1] + vector[1]];
    nextValue = matrix[nextAddress[0]][nextAddress[1]];
  }
  if (nextValue === value || nextValue === 0) {
    matrix[currentAddress[0]][currentAddress[1]] = 0;
    matrix[nextAddress[0]][nextAddress[1]] = value + nextValue;
  }
  return false;
}

function hasEmptyCell(matrix) {
  for (let i = 0; i < COL_COUNT; i++) {
    for (let j = 0; j < ROW_COUNT; j++) {
      if (matrix[i][j] === 0) {
        return true;
      }
    }
  }
  return false;
}

function hasAnyMoves(matrix) {
  for (let i = 0; i < COL_COUNT; i++) {
    for (let j = 0; j < ROW_COUNT; j++) {
      if (matrix[i][j] === 0) {
        return true;
      }
      if (i + 1 < COL_COUNT && matrix[i][j] === matrix[i + 1][j]) {
        return true;
      }
      if (j + 1 < ROW_COUNT && matrix[i][j] === matrix[i][j + 1]) {
        return true;
      }
    }
  }
  return false;
}

class Game extends Component {
  constructor(props) {
    super(props);
    this.state = {
      matrix: createMatrix()
    }
  }

  move(direction) {
    let { matrix } = this.state;
    const initialMatrix = _.cloneDeep(matrix);
    const vector = VECTORS[direction];
    const inversedVector = [vector[0] * -1, vector[1] * -1];
    const facet = getFarthestFacet(direction);
    _.forEach(facet, address => {
      let currentAddress = address;
      while(isValid(currentAddress)) {
        pushCell(matrix, currentAddress, direction);
        currentAddress = [currentAddress[0] + inversedVector[0], currentAddress[1] + inversedVector[1]];
      }
    });
    if (!_.isEqual(initialMatrix, matrix)) {
      matrix = fillRandomEmptyCell(matrix);
    }
    this.setState({
      matrix
    });
  }

  bindHotkeys() {
    _.map(DIRECTIONS, (direction, i) => {
      Mousetrap.bind(direction.toLowerCase(), () => {
        this.move(direction);
        return false;
      });
      return null;
    });
  }

  componentDidMount = () => {
    this.bindHotkeys();
  };

  renderTable() {
    const { matrix } = this.state;
    return <table cellspacing="5" cellpadding="5">
      <tbody>
        {_.map(_.range(ROW_COUNT), function(row) {
          return <tr key={row}>
            {_.map(_.range(COL_COUNT), function(col) {
              return <td key={col}><span class="is-size-1">{matrix[col][row]}</span></td>
            })}
          </tr>
        })}
      </tbody>
    </table>
  }

  render() {
    const { matrix } = this.state;
    return <div className="container">
      {_.map(_.range(ROW_COUNT), function(row) {
        return <div className="columns" key={row}>
          {_.map(_.range(COL_COUNT), function(col) {
            return <div className="column" key={col}><span className="is-size-1">{matrix[col][row] === 0 ? '.' : matrix[col][row]}</span></div>
          })}
        </div>
      })}
    </div>
  }
}

export default Game;
