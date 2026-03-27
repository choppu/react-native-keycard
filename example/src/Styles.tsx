import { StyleSheet } from "react-native";

export const backgroundColor = '#000000';
export const backgroundColorTransparent = '#cccccc11'
export const neutralSolid = '#111111bb';
export const neutral90 = '#1d1d1d';
export const logBgColor = '#26272988';
export const defaultFont = 'InterVariable';
export const logFont = 'SourceCodePro';
export const secondaryColor = '#FF6400cc';
export const buttonTextColor = '#ffffffcc';
export const white80 = '#ffffff88'

const Styles = StyleSheet.create({
  mainContainer: {
    backgroundColor: backgroundColor,
    color: 'white',
    width: '100%',
    height: '100%',
    letterSpacing: -.9
  },
  container: {
    width: '100%',
    height: '100%',
    display: 'flex',
    flexDirection: 'column',
    justifyContent: 'flex-end',
  },
  screenContainer: {
    width: '100%',
    height: '100%',
    display: 'flex',
    flexDirection: 'column',
    gap: 10
  },
  textContainer: {
    width: '100%',
    paddingTop: 80,
  },
  headingLarge: {
    fontSize: 40,
    lineHeight: 48,
    color: 'white',
    textAlign: 'center',
    fontFamily: defaultFont,
  },
  heading: {
    color: buttonTextColor,
    textAlign: 'center',
    fontSize: 27,
    fontFamily: defaultFont,
    lineHeight: 40,
  },
  subtitle: {
    textAlign: 'center',
    paddingTop: 20,
    color: 'white',
    fontSize: 18,
    lineHeight: 24,
    width: '60%',
    marginLeft: '20%',
    marginRight: '20%'
  },
  multipassImg: {
    width: '80%',
    height: '38%',
    resizeMode: 'contain',
    marginLeft: '10%',
    marginRight: '10%',
    marginTop: 80
  },
  footer: {
    width: '100%',
    position: 'absolute',
    bottom: 40,
    justifyContent: 'center'
  },
  sublinkContainer: {
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'center',
    paddingTop: 20
  },
  sublinkText: {
    color: 'white',
    fontSize: 12,
    fontFamily: defaultFont
  },
  sublinkAction: {
    color: 'white',
    fontSize: 12,
    fontFamily: defaultFont,
    textDecorationLine: 'underline'
  },

  modalContainer: {
    justifyContent: 'flex-end',
    margin: 0,
  },
  modalContent: {
    height: 350,
    width: '100%',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    gap: 20,
    paddingTop: '5%',
    backgroundColor: neutralSolid,
    borderTopLeftRadius: 38,
    borderTopRightRadius: 38
  },
  modalHeader: {
    fontSize: 24,
    fontFamily: defaultFont,
    color: 'white',
    fontWeight: '600'
  },
  modalPrompt: {
    fontSize: 15,
    fontFamily: defaultFont,
    paddingBottom: 30,
    color: 'white',
    fontWeight: '300'

  },
  modalIconContainer: {
    width: 'fit-content',
    height: 'fit-content',
    boxSizing: 'border-box'
  },
  navContainer: {
    flexDirection: 'row',
    width: '95%',
    marginLeft: 'auto',
    marginRight: 'auto'
  },
  tabsContainer: {
    width: '60%',
    height: 55,
    backgroundColor: secondaryColor,
    display: 'flex',
    flexDirection: 'row',
    marginLeft: 'auto',
    marginRight: 'auto',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderRadius: 38,
    shadowColor: logBgColor,
    elevation: 10,
  },
  tabIcon: {
    backgroundColor: 'transparent',
    flexGrow: 1,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    height: '100%'
  },
  tabHeading: {
    color: buttonTextColor,
    fontFamily: defaultFont,
    fontWeight: '500',
    fontSize: 26,
    width: '85%',
    marginLeft: 'auto',
    marginRight: 'auto',
    paddingBottom: 20,
    paddingTop: 5
  }
});

export default Styles;
