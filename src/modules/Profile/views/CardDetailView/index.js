/* @flow */
import * as React from 'react';
import {
  ActivityIndicator,
  View,
  Text,
  TextInput,
  TouchableOpacity,
  KeyboardAvoidingView,
  ScrollView,
  NativeModules,
  Alert,
  Image,
} from 'react-native';
import { NavigationActions } from 'react-navigation';
import i18n from 'i18next';
import EStyleSheet from 'react-native-extended-stylesheet';
import { loadProfile } from 'opencityHelsinki/src/profile';
import { removeCardFromTunnistamo } from 'src/modules/Profile/CardManager';
import colors from 'src/config/colors';
import BackIcon from 'opencityHelsinki/img/arrow_back.png';
import styles from './styles';
import trash from '../../../../../img/trash.png';

class CardDetailView extends React.Component<Props, State> {
  constructor(props) {
    super(props);
    this.state = {
      cardNumber: '',
      cardPin: '',
      cardPinError: false,
    };
  }


  cardPinChangeListener = (value) => {
    this.setState({ cardPin: value });
  }

  validateFields = () => {
    if (this.state.cardNumber.length <= 0 ||
      this.state.cardPin.length <= 0) {
      return false;
    }

    return true;
  }

  onRemovePress = () => {
    Alert.alert(
      `${i18n.t('customerShip:cardRemove')}`,
      `${i18n.t('customerShip:cardRemovePrompt')}`,
      [
        { text: `${i18n.t('common:cancel')}`, onPress: () => console.log('Cancel Pressed'), style: 'cancel' },
        { text: 'OK', onPress: () => this.removeCard() },
      ],
      { cancelable: false },
    );
  }

  cardNumberChangeListener = (value) => {
    this.setState({ cardNumber: value });
  }


  goBack = () => {
    this.props.navigation.goBack();
  }

  registerCard = (card) => {
    return new Promise(async (resolve, reject) => {
      const url = 'https://api.hel.fi/sso-test/v1/user_identity/';
      try {
        const profile = await loadProfile();
        if (profile.auth) {
          const token = profile.auth.accessToken;

          const body = {
            service: 'helmet',
            identifier: card.cardNumber,
            secret: card.cardPin,
          };

          try {
            const res = await fetch(url, {
              method: 'POST',
              body: JSON.stringify(body),
              headers: {
                'Content-Type': 'application/json',
                Accept: 'application/json',
                Authorization: `Bearer ${token}`,
              },
            });

            if (res.status !== 200 && res.status !== 201) {
              throw new Error('User device registration failed');
            }
            resolve(res);
          } catch (error) {
            reject(error);
          }
        }
      } catch (error) {
        reject(error);
      }
    });
  }

  reLinkCard = async () => {
    const { card, refresh } = this.props.navigation.state.params;
    const pin = this.state.firstChar + this.state.secondChar +
    this.state.thirdChar + this.state.fourthChar;

    this.setState({
      commonError: '',
      loading: true,
    });
    const cardInfo = {
      cardNumber: card.cardNumber,
      cardPin: parseInt(pin),
    };
    try {
      await this.registerCard(cardInfo);

      NativeModules.HostCardManager.startNfcService();
      const resetAction = NavigationActions.reset({
        index: 0,
        actions: [NavigationActions.navigate({ routeName: 'Profile' })],
      });

      NativeModules.HostCardManager.setCardInfo(cardInfo).then((response) => {
        this.setState({
          loading: false,
        });
        refresh();
        ToastAndroid.show(`${i18n.t('customerShip:added')}`, ToastAndroid.SHORT);

      });
    } catch (error) {
      this.setState({
        loading: false,
      });
      this.setState({ commonError: `${i18n.t('error:genericCardError')}` });
    }
  }

  removeCard = async () => {
    const { card } = this.props.navigation.state.params;
    const cardInfo = {
      cardNumber: card.cardNumber,
      cardPin: parseInt(card.cardPin),
    };
    await removeCardFromTunnistamo(card);
    const resetAction = NavigationActions.reset({
      index: 0,
      actions: [NavigationActions.navigate({ routeName: 'Profile' })],
    });

    NativeModules.HostCardManager.removeCard(cardInfo).then(async (success) => {
      if (success) {
        this.props.navigation.dispatch(resetAction);
      }
    });
  }

  validateFields = () => {
    const pin = this.state.firstChar + this.state.secondChar + this.state.thirdChar + this.state.fourthChar;
    let errors = false;

    if (pin.length !== 4) {
      this.setState({ cardPinError: true });
      errors = true;
    }

    if (errors) return false;

    return true;
  }

  focusNextField = (nextField) => {
    this.refs[nextField].focus();
  }

  renderPinForm() {
    return (
      <View>
        <View style={{ flexDirection: 'row' }}>
          <View style={styles.pinCodeContainer}>
            <TextInput
              style={styles.pinInput}
              ref={3}
              maxLength={1}
              underlineColorAndroid="transparent"
              keyboardType="numeric"
              returnKeyType="next"
              blurOnSubmit={false}
              secureTextEntry
              value={this.state.firstChar}
              onChangeText={(text) => {
                this.setState({
                  firstChar: text,
                  cardPinError: false,
                });
                if (text.length === 1) this.focusNextField(4);
              }}
            />
          </View>
          <View style={styles.pinCodeContainer}>
            <TextInput
              style={styles.pinInput}
              ref={4}
              maxLength={1}
              underlineColorAndroid="transparent"
              keyboardType="numeric"
              returnKeyType="next"
              blurOnSubmit={false}
              secureTextEntry
              value={this.state.secondChar}
              onChangeText={(text) => {
                this.setState({
                  secondChar: text,
                  cardPinError: false,
                });
                if (text.length === 1) this.focusNextField(5);
                if (text.length === 0) this.focusNextField(3);
              }}
            />
          </View>
          <View style={styles.pinCodeContainer}>
            <TextInput
              style={styles.pinInput}
              ref={5}
              maxLength={1}
              underlineColorAndroid="transparent"
              keyboardType="numeric"
              returnKeyType="next"
              blurOnSubmit={false}
              secureTextEntry
              value={this.state.thirdChar}
              onChangeText={(text) => {
                this.setState({
                  thirdChar: text,
                  cardPinError: false,
                });
                if (text.length === 1) this.focusNextField(6);
                if (text.length === 0) this.focusNextField(4);
              }}
            />
          </View>
          <View style={styles.pinCodeContainer}>
            <TextInput
              style={styles.pinInput}
              ref={6}
              maxLength={1}
              underlineColorAndroid="transparent"
              keyboardType="numeric"
              returnKeyType="next"
              blurOnSubmit={true}
              secureTextEntry
              value={this.state.fourthChar}
              onChangeText={(text) => {
                this.setState({
                  fourthChar: text,
                  cardPinError: false,
                });
                if (text.length === 0) this.focusNextField(5);
              }}
            />
          </View>
        </View>
        <TouchableOpacity
          disabled={this.state.loading}
          onPress={() => {
            if (this.validateFields()) this.reLinkCard();
          }}
        >
          <View style={styles.button}>
            { this.state.loading &&
              <ActivityIndicator
                size={'small'}
                color={EStyleSheet.value('$colors.med')}
              />
            }{!this.state.loading &&
              <Text style={[styles.buttonText, { justifyContent: 'center' }]}>{i18n.t('customerShip:resetPin')}</Text>
            }
          </View>
        </TouchableOpacity>
      </View>
    );
  }

  render() {
    const { Header } = this.props.screenProps;
    const { card } = this.props.navigation.state.params;

    return (
      <KeyboardAvoidingView style={{ flex: 1 }}>
        <Header
          leftAction={{
            icon: BackIcon,
            action: this.goBack,
            style: {
              tintColor: colors.max,
            },
          }}
        />

        <ScrollView
          style={{ flex: 1, backgroundColor: colors.min }}
          keyboardShouldPersistTaps
          // keyboardDismissMode={'on-drag'}
        >
          <View style={styles.container}>
            <Text style={styles.title}>{i18n.t('customerShip:libraryCard')}</Text>
            <Text style={styles.description}>
              {i18n.t('customerShip:libraryCardInfo')}
            </Text>

            <View style={styles.field}>
              <Text style={styles.fieldLabel}>{i18n.t('customerShip:libraryCardNumber')}</Text>
              <Text style={styles.fieldText}>{card.cardNumber.replace(/(\d{1})\D?(\d{4})\D?(\d{5})\D?(\d{4})\D?/, '$1 $2 $3 $4')}</Text>
            </View>

            {!card.cardPin &&
              this.renderPinForm()
            }
            {this.state.cardPinError &&
              <Text style={styles.error}>{i18n.t('error:pinCodeError')}</Text>
            }

            <TouchableOpacity onPress={() => this.onRemovePress()}>
              <View style={styles.button}>
                <Image source={trash} style={{ height: 32, width: 32 }} />
                <Text style={styles.buttonText}>{i18n.t('customerShip:forgetInfo')}</Text>
              </View>
            </TouchableOpacity>

            <TouchableOpacity
              onPress={() => {
                this.props.navigation.navigate('CardInfoScreen');
              }}
            >
              <Text style={styles.link}>{`${i18n.t('customerShip:infoAndGuide')} >`}</Text>
            </TouchableOpacity>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    );
  }
}

export default CardDetailView;
