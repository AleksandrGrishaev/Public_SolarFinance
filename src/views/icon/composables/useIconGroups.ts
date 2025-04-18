// src/views/icon/composables/useIconGroups.ts
import { ref, computed } from 'vue';
import * as TablerIcons from '@tabler/icons-vue';

// Categories for organizing icons
const ICON_CATEGORIES = {
  Money: [
    'IconCoin', 'IconCurrencyDollar', 'IconCurrencyEuro', 'IconCurrencyBitcoin',
    'IconCurrencyPound', 'IconCurrencyYen', 'IconCreditCard', 'IconWallet',
    'IconPigMoney', 'IconBuildingBank'
  ],
  Transport: [
    'IconCar', 'IconBus', 'IconTrain', 'IconPlane', 'IconHelicopter',
    'IconBike', 'IconScooter', 'IconWalk', 'IconShip', 'IconGasStation'
  ],
  Home: [
    'IconHome', 'IconBed', 'IconSofa', 'IconDeviceTv', 'IconWifi',
    'IconDoor', 'IconGardenCart', 'IconLamp', 'IconAirConditioner', 'IconFridge'
  ],
  Food: [
    'IconMeat', 'IconBread', 'IconEgg', 'IconMilk', 'IconVegetable',
    'IconFruits', 'IconPizza', 'IconGlass', 'IconCoffee', 'IconBeerFilled'
  ],
  Shopping: [
    'IconShoppingCart', 'IconShoppingBag', 'IconBasket', 'IconDiscount',
    'IconShirt', 'IconShoe', 'IconHanger', 'IconGift', 'IconPackage', 'IconTag'
  ],
  Health: [
    'IconHeartbeat', 'IconStethoscope', 'IconPill', 'IconFirstAidKit',
    'IconActivity', 'IconVirus', 'IconDental', 'IconEye', 'IconWheelchair', 'IconSyringe'
  ],
  Entertainment: [
    'IconMovie', 'IconMusic', 'IconDeviceGamepad', 'IconTicket', 'IconCamera',
    'IconMicrophone', 'IconTheater', 'IconPalette', 'IconBook', 'IconDeviceTvOld'
  ],
  Sport: [
    'IconBallFootball', 'IconBallBasketball', 'IconBallTennis', 'IconYoga',
    'IconSwimming', 'IconRun', 'IconBike', 'IconWeightlifting', 'IconGolf', 'IconJumpRope'
  ],
  Travel: [
    'IconMap', 'IconMapPin', 'IconCompass', 'IconSuitcase', 'IconBeach',
    'IconMountain', 'IconSunset', 'IconCampfire', 'IconTent', 'IconPassport'
  ],
  Technology: [
    'IconDevice', 'IconDeviceLaptop', 'IconDeviceMobile', 'IconWifi',
    'IconPrinter', 'IconDeviceWatch', 'IconRouter', 'IconServer', 'IconKeyboard', 'IconMouse'
  ],
  Education: [
    'IconSchool', 'IconBooks', 'IconNotebook', 'IconPencil', 'IconRuler',
    'IconCalculator', 'IconBackpack', 'IconPresentation', 'IconGraduationCap', 'IconCertificate'
  ],
  Business: [
    'IconBriefcase', 'IconChartBar', 'IconChartPie', 'IconReportMoney',
    'IconBuildingSkyscraper', 'IconGraph', 'IconTrendingUp', 'IconUserCircle', 'IconTimeline', 'IconFileInvoice'
  ],
  Crypto: [
    'IconCurrencyBitcoin', 'IconCurrencyEthereum', 'IconCurrencyDogecoin', 'IconCurrencyLitecoin',
    'IconCurrencyMonero', 'IconBlockchain', 'IconCoin', 'IconWallet', 'IconArrowsExchange', 'IconLock'
  ]
};

export function useIconGroups() {
  const searchQuery = ref('');
  
  // Validate icon names against available Tabler icons
  const validateIconNames = (iconNames) => {
    return iconNames.filter(iconName => 
      typeof TablerIcons[iconName] === 'object' || typeof TablerIcons[iconName] === 'function'
    );
  };
  
  // Initialize validated categories
  const validatedCategories = {};
  Object.entries(ICON_CATEGORIES).forEach(([category, icons]) => {
    validatedCategories[category] = validateIconNames(icons);
  });
  
  // Get filtered icons grouped by category
  const filteredIconGroups = computed(() => {
    // Ensure we always return an object, even if empty
    const result = {};
    
    const query = searchQuery.value.toLowerCase();
    
    // Process predefined categories
    Object.entries(validatedCategories).forEach(([category, icons]) => {
      // Filter icons by search query
      const filteredIcons = icons.filter(icon => {
        // Remove 'Icon' prefix and convert to lowercase for search
        const iconName = icon.replace('Icon', '').toLowerCase();
        return !query || iconName.includes(query);
      });
      
      // Only add category if it has matching icons
      if (filteredIcons.length > 0) {
        result[category] = filteredIcons;
      }
    });
    
    // If no results and no search query, return at least Money category
    if (Object.keys(result).length === 0 && !query) {
      result['Money'] = validatedCategories['Money'] || [];
    }
    
    return result;
  });
  
  // Get component for icon name
  const getIconComponent = (iconName) => {
    return TablerIcons[iconName] || null;
  };
  
  return {
    searchQuery,
    filteredIconGroups,
    getIconComponent,
    allIconCategories: Object.keys(validatedCategories)
  };
}