import React from 'react';
import { Header } from 'open-city-modules/src/components';
import img from 'Helsinki/img/city.png';
import logo from 'Helsinki/img/city-logo.png';
import colors from 'src/config/colors';

const MyHeader = (props) => {
  const { defaultRightAction } = props;
  return (
    <Header
      // title="Helsinki App"
      headerImage={logo}
      // rightAction={{
      //   icon: img,
      //   style: { tintColor: colors.max },
      //   action: defaultRightAction,
      // }}
      {...props}
    />
  );
};

export default MyHeader;
