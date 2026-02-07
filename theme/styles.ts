import { colors } from './colors';
import { fontWeights, fontSizes } from './typography';

export const headerStyles = {
  headerTitleStyle: {
    fontFamily: 'Baloo2_700Bold',
    fontSize: 20,
    color: colors.darkBlue,
    letterSpacing: 0.5,
  },
  headerTintColor: colors.darkBlue,
  headerStyle: {
    elevation: 0,
    shadowOpacity: 0,
    borderBottomWidth: 0,
    backgroundColor: colors.background.primary,
  }
};

export const tabHeaderStyles = {
  headerTitleStyle: {
    fontFamily: 'Baloo2_700Bold',
    fontSize: 20,
    color: colors.darkBlue,
  },
  headerStyle: {
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 5,
    borderBottomWidth: 0,
    backgroundColor: colors.background.primary,
  },
  tabBarActiveTintColor: colors.mediumOrange,
  tabBarInactiveTintColor: colors.lightBlue,
  tabBarStyle: {
    elevation: 8,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.15,
    shadowRadius: 5,
    backgroundColor: colors.background.primary,
    height: 70,
    paddingBottom: 8,
    paddingTop: 6,
    paddingHorizontal: 12,
    borderTopWidth: 0,
    position: 'absolute',
    bottom: 15,
    left: 25,
    right: 25,
    borderRadius: 30,
    marginHorizontal: 10,
  },
  tabBarLabelStyle: {
    fontSize: fontSizes.xs,
    fontWeight: fontWeights.semiBold,
  },
  tabBarItemStyle: {
    pressOpacity: 0,
  },
}; 