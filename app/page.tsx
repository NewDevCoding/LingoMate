import React from 'react';

const styles = {
  Screen: {
    backgroundColor: '#161616',
    minHeight: '100vh',
    width: '100%',
  },
};

const Screen = (props) => {
  return (
    <div style={styles.Screen}>
      {props.children}
    </div>
  );
};

export default Screen;
