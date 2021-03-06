import React, { Component } from 'react';
import {
  ActivityIndicator,
  Alert,
  View,
  Text,
  TextInput,
  TouchableOpacity,
  Platform,
  ScrollView,
  UIManager,
  LayoutAnimation,
  StyleSheet,
  ToastAndroid,
  KeyboardAvoidingView
} from 'react-native';
import colors from 'src/config/colors';
import i18n from 'i18next';
import EStyleSheet from 'react-native-extended-stylesheet';
import FormInput from 'Helsinki/src/modules/Profile/components/FormInput';
import { makeRequest } from 'Helsinki/src/utils/requests';
import Config from 'Helsinki/src/config/config.json';
import BackIcon from 'Helsinki/img/arrow_back.png';
import styles from './styles';

// View for sending feedback about the application itself
class AppFeedbackView extends Component {
  constructor(props, context) {
    super(props, context);
    this.state = {
      descriptionText: '',
      titleText: '',
      nameText: '',
      emailText: '',
      sendEnabled: false,
    };

    // Needed for LayoutAnimation to work on android.
    if (Platform.OS === 'android') { UIManager.setLayoutAnimationEnabledExperimental(true); }
  }

  componentWillMount() {
  }

  goBack = () => {
    this.props.navigation.goBack();
  }

  onDescriptionTextChange(text) {
    // Stop adding text if the limit is reached
    if (text.length < Config.OPEN311_DESCRIPTION_MAX_LENGTH) {
      this.setState({ descriptionText: text });
    }

    // Enable send button if the length of the description is within limits
    if (text.length >= Config.OPEN311_DESCRIPTION_MIN_LENGTH &&
        text.length <= Config.OPEN311_DESCRIPTION_MAX_LENGTH) {
      this.setState({
        sendEnabled: true,
      });
    } else {
      this.setState({
        sendEnabled: false,
      });
    }
  }

  onSendButtonClick() {
    if (this.state.descriptionText.length >= Config.OPEN311_DESCRIPTION_MIN_LENGTH &&
        this.state.descriptionText.length <= Config.OPEN311_DESCRIPTION_MAX_LENGTH) {
      this.sendFeedback();
    } else {
      Alert.alert(
        `${i18n.t('error:descriptionLengthErrorTitle')}`,
        `${i18n.t('error:descriptionLengthErrorMessage')}`,
        [
          { text: '' },
          { text: `${i18n.t('error:descriptionErrorButton')}` },
        ],
      );
    }
  }

  async sendFeedback() {
    this.setState({ loading: true });
    const url = Config.OPEN311_SEND_SERVICE_URL;
    const headers = {
      'Content-Type': 'multipart/form-data',
      'Accept': 'application/json'
    };
    let data = new FormData();

    this.setState({ spinnerVisible: true });
    data.append('api_key', Config.OPEN311_SEND_SERVICE_API_KEY);
    data.append('service_code', Config.APP_FEEDBACK_SERVICE_CODE);
    data.append('description', this.state.descriptionText);
    data.append('title', this.state.titleText !== null ? this.state.titleText : '');
    data.append('first_name', this.state.nameText);
    data.append('email', this.state.emailText !== null ? this.state.emailText : '');

    try {
      const result = await makeRequest(url, 'POST', headers, data)
      this.setState({
        spinnerVisible: false,
        loading: false,
      });
      ToastAndroid.show('Lähettäminen onnistui', ToastAndroid.SHORT);
      this.props.navigation.goBack();
    } catch (error) {
      Alert.alert(
        `${i18n.t('error:networkErrorTitle')}`,
        `${i18n.t('error:networkErrorMessage')}`,
        [
          { text: '' },
          { text: `${i18n.t('error:networkErrorButton')}` },
        ],
      );
    }
  }

  render() {
    const { Header } = this.props.screenProps;

    return (
      <View style={styles.container}>
        {!!Header &&
          <Header
            leftAction={{
              icon: BackIcon,
              action: this.goBack,
              style: {
                tintColor: colors.max,
              },
            }}
          />
        }
        <KeyboardAvoidingView
          behavior={'postion' || 'height' || 'padding'}
          style={styles.innerContainer}
        >
          <ScrollView
            ref={(ref) => this.scroll = ref}
            style={styles.scrollView}>
            <View style={styles.subHeader}><Text style={styles.header}>{i18n.t('feedBack:appFeedbackViewTitle')}</Text></View>
            <View style={styles.contentContainer}>
              <View style={styles.titleView}>
                <Text style={styles.title}>{i18n.t('feedBack:titlePlaceholder')}</Text>
                <TextInput
                  style={styles.titleText}
                  onChangeText={(text) => { this.setState({ titleText: text }); }}
                  underlineColorAndroid="transparent"
                  autoCapitalize="sentences"
                />
              </View>

              <View style={styles.descriptionView}>
                <Text style={[styles.title, { marginBottom: 16 }]}>{i18n.t('feedBack:descriptionPlaceholder')}</Text>
                <TextInput
                  style={[styles.descriptionText]}
                  multiline={true}
                  onLayout={(e) => {
                    this.scroll.scrollTo({x: 0, y: e.nativeEvent.layout.y + e.nativeEvent.layout.height})
                  }}
                  underlineColorAndroid="transparent"
                  onChangeText={(text) => {
                    this.onDescriptionTextChange(text);
                  }}
                  autoCapitalize="sentences"
                />
              </View>
              <View style={[styles.titleView, { marginTop: 12 }]}>
                <Text style={styles.title}>{i18n.t('feedBack:namePlaceholder')}</Text>
                <TextInput
                  style={styles.titleText}
                  onChangeText={(text) => { this.setState({ nameText: text }); }}
                  underlineColorAndroid="transparent"
                  autoCapitalize="sentences"
                />
              </View>
              <View style={[styles.titleView, { marginTop: 12 }]}>
                <Text style={styles.title}>{i18n.t('feedBack:emailPlaceholder')}</Text>
                <TextInput
                  style={styles.titleText}
                  onChangeText={(text) => { this.setState({ emailText: text }); }}
                  underlineColorAndroid="transparent"
                  autoCapitalize="sentences"
                />
              </View>
              <TouchableOpacity
                disabled={this.state.loading}
                onPress={() => {
                  this.onSendButtonClick();
                }}
              >
                <View style={[styles.button, { opacity: this.state.loading ? 0.5 : 1 }]}>
                  <Text
                    style={styles.buttonText}
                  >
                    {i18n.t('common:continue')}
                  </Text>
                </View>
              </TouchableOpacity>
            </View>
          </ScrollView>

        </KeyboardAvoidingView>
        {this.state.spinnerVisible &&
          <View style={{ ...StyleSheet.absoluteFillObject, justifyContent: 'center', alignItems: 'center' }}>
            <ActivityIndicator
              size="large"
              // color={EStyleSheet.value('$color.med')}
            />
          </View>}
      </View>
    );
  }
}

export default AppFeedbackView;
