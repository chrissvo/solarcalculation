import Ember from 'ember';

export default Ember.Controller.extend({

  queryParams: ['systemId'],

  // functions

  emailLink: function() {
    const systemId = this.get('model.system.id');
    const email = this.get('model.customer.email');
    return 'mailto:' + email +
      '?subject=Resultaat%20SAMAN%20Rekenmodel%20Zakelijk' +
      '&body=Dit%20is%20een%20directe%20link%20naar%20de%20resultaten%20van%20uw%20rekenmodel%3A%20' +
      'https://saman.christian.surf/business/model/results?systemId=' + systemId;
  }.property(),

  // properties
  systemPower: function() {
    const panelAmount = this.get('model.system.panelAmount');
    const panelPower = this.get('model.system.panelPower');
    return panelAmount * panelPower;
  }.property(),

  energyProduction: function() {
    const systemPower = this.get('systemPower');
    const roofOrientationFactor = this.get('roofOrientationFactor');
    return systemPower * (roofOrientationFactor / 100) * 0.975;
  }.property(),

  grossInvestment: function() {
    const panelPrice = this.get('model.system.panelPrice');
    const systemPower = this.get('systemPower');
    return panelPrice * systemPower;
  }.property(),

  energyTaxBracket1: function() {
    const energyUsage = this.get('model.company.energyUsage');
    if (energyUsage > 10000) {
      return 10000 * 0.1258;
    }
    return energyUsage * 0.1258;
  }.property(),

  energyTaxBracket2: function() {
    const energyUsage = this.get('model.company.energyUsage');
    if (energyUsage > 50000) {
      return 40000 * 0.05696;
    }
    else if (energyUsage <= 10000) {
      return 0;
    }
    return (energyUsage - 10000) * 0.05696;
  }.property(),

  energyTaxBracket3: function() {
    const energyUsage = this.get('model.company.energyUsage');
    if (energyUsage > 50000) {
      return (energyUsage - 50000) * 0.01521;
    }
    return 0;
  }.property(),

  totalEnergyTax: function() {
    const energyTaxBracket1 = this.get('energyTaxBracket1');
    const energyTaxBracket2 = this.get('energyTaxBracket2');
    const energyTaxBracket3 = this.get('energyTaxBracket3');
    return energyTaxBracket1 + energyTaxBracket2 + energyTaxBracket3;
  }.property(),

  energyTax: function() {
    const totalEnergyTax = this.get('totalEnergyTax');
    const energyUsage = this.get('model.company.energyUsage');
    return totalEnergyTax / energyUsage;
  }.property(),

  taxRate: function() {
    const incomeCategory = this.get('model.company.incomeCategory');
    let taxRate = 0;
    if (incomeCategory !== undefined) {
      switch (incomeCategory) {
        case '€ 0 - € 18.628':
          taxRate = 0.33;
          break;
        case '€ 18.628 - € 33.436':
          taxRate = 0.4195;
          break;
        case '€ 33.436 - € 55.694':
          taxRate = 0.42;
          break;
        case '€ 55.694 en hoger':
          taxRate = 0.52;
          break;
        case 'minder dan € 200.000':
          taxRate = 0.20;
          break;
        case 'meer dan € 200.000':
          taxRate = 0.25;
          break;
      }
    }
    return taxRate;
  }.property(),

  EIA: function() {
    const panelPrice = this.get('model.system.panelPrice');
    const connection = this.get('model.company.connection');
    if (connection === "Aansluiting groter dan 3x80A") {
      return 0;
    }

    const systemPower = this.get('systemPower');
    const grossInvestment = this.get('grossInvestment');

    if (systemPower > 25000 && grossInvestment > 2300) {
      const maxEIA = systemPower / 1000 * 750;
      if (grossInvestment * 0.58 > maxEIA) {
        return maxEIA;
      }
      return grossInvestment * 0.58;
    }
    return 0;
    
  }.property(),

  solarKIA: function() {
    const otherInvestments = this.get('model.company.otherInvestments');
    const grossInvestment = this.get('grossInvestment');
    const totalInvestment = grossInvestment + otherInvestments;

    if (totalInvestment <= 2300) {
      return 0;
    }
    else if (totalInvestment <= 55248) {
      return grossInvestment * 0.28;
    }
    else if (totalInvestment <= 102311) {
      if (otherInvestments > 15470) {
        // other investments eat up the return
        return 0;
      }
      else {
        return 15470 - otherInvestments;
      }
    }
    else if (totalInvestment <= 306931) {
      if (otherInvestments > 15470 - 0.756 * totalInvestment) {
        // other investments eat up the return
        return 0;
      }
      else {
        return 15470 - 0.756 * otherInvestments;
      }
    }
    return 0;
  }.property(),

  KIA: function() {
    const otherInvestments = this.get('model.company.otherInvestments');
    const grossInvestment = this.get('grossInvestment');
    const totalInvestment = grossInvestment + otherInvestments;

    if (totalInvestment <= 2300) {
      return 0;
    }
    else if (totalInvestment <= 55248) {
      return totalInvestment * 0.28;
    }
    else if (totalInvestment <= 102311) {
      return 15470;
    }
    else if (totalInvestment <= 306931) {
      return 15470 - 0.756 * totalInvestment;
    }
    return 0;
  }.property(),

  sdeBaseAmount: function() {
    const sdePhase = this.get('model.system.sdePhase');
    let baseAmount;
    switch (sdePhase) {
      case 'Fase 1 (vanaf 31 maart)':
        baseAmount = 0.070;
        break;
      case 'Fase 2 (vanaf 20 april)':
        baseAmount = 0.080;
        break;
      case 'Fase 3 (vanaf 11 mei)':
        baseAmount = 0.090;
        break;
      case 'Fase 4 (vanaf 1 juni)':
        baseAmount = 0.100;
        break;
      case 'Fase 5 (vanaf 22 juni)':
        baseAmount = 0.110;
        break;
      case 'Fase 6 (vanaf 31 augustus)':
        baseAmount = 0.120;
        break;
      case 'Fase 7 (vanaf 21 september)':
        baseAmount = 0.130;
        break;
      case 'Fase 8 (vanaf 12 oktober)':
        baseAmount = 0.140;
        break;
      case 'Fase 9 (vanaf 9 november)':
        baseAmount = 0.141;
        break;
    }
    return baseAmount;
  }.property(),

  sdeContribution: function() {
    const connection = this.get('model.company.connection');
    const systemPower = this.get('systemPower');
    const apxPrice = this.get('model.system.apxPrice');
    const sdeBaseAmount = this.get('sdeBaseAmount');
    if (systemPower >= 15000 && connection === 'Aansluiting groter dan 3x80A') {
      if (apxPrice > 0.035) {
        return sdeBaseAmount - apxPrice;
      }
      return sdeBaseAmount - 0.035;
    }
    return 0;
  }.property(),

  sdeLifeContribution: function() {
    const energyProduction = this.get('energyProduction');
    const sdeContribution = this.get('sdeContribution');
    return energyProduction * sdeContribution * 15;
  }.property(),

  totalTaxDeduction: function() {
    const EIA = this.get('EIA');
    const solarKIA = this.get('solarKIA');
    const grossInvestment = this.get('grossInvestment');
    const initialDepreciationPercentage = this.get('initialDepreciationPercentage');
    const initialTaxDeduction = EIA + solarKIA + grossInvestment * initialDepreciationPercentage;
    const restTaxDeduction = grossInvestment * (1 - initialDepreciationPercentage);
    const taxRate = this.get('taxRate');
    const initialFiscalAdvantage = initialTaxDeduction * taxRate;
    const restFiscalAdvantage = restTaxDeduction * taxRate;
    return initialFiscalAdvantage + restFiscalAdvantage;
  }.property(),

  // data collections
  situationData: function() {
    return [{
      label: 'Juridische bedrijfsvorm',
      value: this.get('model.company.companyType')
    }, {
      label: 'Inkomen / winst',
      value: this.get('model.company.incomeCategory')
    }, {
      label: 'Huidig verbruik',
      value: this.get('model.company.energyUsage'),
      type: 'number',
      suffix: 'kWh/jaar'
    }, {
      label: 'Netto energieprijs',
      value: this.get('model.company.energyPrice'),
      type: 'currency',
      suffix: 'per kWh',
      precision: 3
    }, {
      label: 'Factor eigen verbruik',
      value: this.get('model.company.factorOwnUsage'),
      type: 'number',
      precision: 0,
      suffix: '%'
    }, {
      label: 'Aansluiting',
      value: this.get('model.company.connection')
    }];
  }.property('model.company', 'model.system'),

  energyData: function() {
    const energyUsage = this.get('model.company.energyUsage');
    const energyPrice = this.get('model.company.energyPrice');
    const energyCost = energyUsage * energyPrice;
    const energyTax = this.get('energyTax');
    const totalEnergyTax = this.get('totalEnergyTax');

    return [{
      label: 'Netto energiekosten',
      value: energyCost,
      type: 'currency'
    }, {
      label: 'Totale energiebelasting',
      value: totalEnergyTax,
      type: 'currency'
    }, {
      label: 'Totale energiekosten',
      value: totalEnergyTax + energyCost,
      type: 'currency'
    }, {
      label: 'Energiebelasting',
      value: energyTax,
      type: 'currency',
      precision: 3
    }, {
      label: 'Bruto energieprijs',
      value: (totalEnergyTax + energyCost) / energyUsage,
      type: 'currency',
      precision: 3
    }];
  }.property('model.company', 'model.system'),

  solarData: function() {
    const panelAmount = this.get('model.system.panelAmount');
    const panelPower = this.get('model.system.panelPower');
    const systemPower = this.get('systemPower');
    return [{
      label: 'Aantal te plaatsen panelen',
      value: panelAmount,
      type: 'number',
      precision: 0,
      suffix: 'stuks'
    }, {
      label: 'Vermogen per paneel',
      value: panelPower,
      type: 'number',
      precision: 0,
      suffix: 'Watt piek'
    }, {
      label: 'Totaal vermogen',
      value: systemPower,
      type: 'number',
      precision: 0,
      suffix: 'Watt piek'
    }];
  }.property('model.company', 'model.system'),

  investmentData: function() {
    const panelPrice = this.get('model.system.panelPrice');
    const grossInvestment = this.get('grossInvestment');
    const totalTaxDeduction = this.get('totalTaxDeduction');
    const netInvestment = grossInvestment - totalTaxDeduction;

    return [{
      label: 'Kosten per wp',
      value: panelPrice,
      type: 'currency'
    }, {
      label: 'Bruto investering',
      value: grossInvestment,
      type: 'currency'
    }, {
      label: 'Netto fiscaal voordeel',
      value: totalTaxDeduction,
      type: 'currency'
    }, {
      label: 'Netto investering',
      value: netInvestment,
      type: 'currency'
    }];
  }.property('model.company', 'model.system'),

  savingsData: function() {
    const sdeContribution = this.get('sdeContribution');
    const sdeBaseAmount = this.get('sdeBaseAmount');
    const apxPrice = this.get('model.system.apxPrice');
    const energyProduction = this.get('energyProduction');
    const energyUsage = this.get('model.company.energyUsage');
    const energyPrice = this.get('model.company.energyPrice');
    const factorOwnUsage = this.get('model.company.factorOwnUsage');
    const connection = this.get('model.company.connection');
    const totalEnergyTax = this.get('totalEnergyTax');
    const taxBracket3 = this.get('energyTaxBracket3');
    const taxBracket2 = this.get('energyTaxBracket2');
    const taxBracket1 = this.get('energyTaxBracket1');
    const grossInvestment = this.get('grossInvestment');
    const totalTaxDeduction = this.get('totalTaxDeduction');
    const netInvestment = grossInvestment - totalTaxDeduction;

    let energyTaxSaving;
    if (energyProduction > energyUsage) {
      energyTaxSaving = totalEnergyTax;
    }
    else {
      // production is smaller than current usage
      if (taxBracket3 > 0) {
        if (energyProduction - 50000 > 0) {
          // production is bigger than usage in the 3rd bracket
          if (energyProduction > energyUsage - 10000) {
            // production is bigger than usage in the 2nd bracket
            energyTaxSaving = taxBracket3 + taxBracket2 + taxBracket1 - ((energyUsage - energyProduction) * 0.1258);
          }
          else {
            // production is smaller than usage in the 2nd bracket
            energyTaxSaving = taxBracket3 + taxBracket2 - ((energyUsage - energyProduction ) * 0.05696);
          }
        }
        else {
          // production is smaller than usage in the 3rd bracket
          energyTaxSaving = taxBracket3 - ((energyUsage - energyProduction ) * 0.01521);
        }
      }
      else if (taxBracket2 > 0) {
        if (energyProduction > energyUsage - 10000) {
          // production is bigger than usage in the 2nd bracket
          energyTaxSaving = taxBracket2 + taxBracket1 - ((energyUsage - energyProduction) * 0.1258);
        }
        else {
          // production is smaller than usage in the 2nd bracket
          energyTaxSaving =  taxBracket2 - ((energyUsage - energyProduction ) * 0.05696);
        }
      }
      else {
        // production is smaller than usage in the 3rd bracket
        energyTaxSaving = energyProduction * 0.1258;
      }
    }

    let productionSavings;
    if (connection === 'Aansluiting groter dan 3x80A') {
      if (sdeContribution > 0) {
        productionSavings = energyProduction * sdeBaseAmount;
      }
      else {
        productionSavings = energyProduction * apxPrice;
      }
    }
    else {
      if (energyProduction > energyUsage) {
        productionSavings = energyUsage * energyPrice + (energyProduction - energyUsage) * apxPrice + totalEnergyTax;
      }
      else {
        productionSavings = energyProduction * energyPrice + energyTaxSaving;
      }
    }

    let personalSavings;
    if (connection === 'Aansluiting kleiner dan of gelijk aan 3x80A') {
      personalSavings = 0;
    }
    else {
      if (energyProduction * (factorOwnUsage / 100) > energyUsage) {
        personalSavings = energyUsage * (energyPrice - apxPrice) + totalEnergyTax;
      }
      else {
        personalSavings = energyProduction * (factorOwnUsage / 100) * (energyPrice - apxPrice) + energyTaxSaving;
      }
    }

    const returnTime = netInvestment / (productionSavings + personalSavings);
    const ROI = 1 / returnTime * 100;

    if (connection === 'Aansluiting groter dan 3x80A') {
      return [{
        label: 'Opbrengst energieproductie',
        value: productionSavings,
        type: 'currency',
        suffix: 'per jaar'
      }, {
        label: 'Besparing eigen verbruik',
        value: personalSavings,
        type: 'currency',
        suffix: 'per jaar'
      }, {
        label: 'Totale jaarlijkse besparing',
        value: productionSavings + personalSavings,
        type: 'currency',
        suffix: 'per jaar'
      }, {
        label: 'Terugverdientijd',
        value: returnTime,
        type: 'number',
        precision: 1,
        suffix: 'jaar'
      }, {
        label: 'Rendement',
        value: ROI,
        type: 'number',
        precision: 1,
        suffix: '%'
      }];
    }
    // connection === Aansluiting kleiner dan of gelijk aan 3x80A
    else {
      return [{
        label: 'Opbrengst energieproductie',
        value: productionSavings,
        type: 'currency',
        suffix: 'per jaar'
      }, {
        label: 'Totale jaarlijkse besparing',
        value: productionSavings + personalSavings,
        type: 'currency',
        suffix: 'per jaar'
      }, {
        label: 'Terugverdientijd',
        value: returnTime,
        type: 'number',
        precision: 1,
        suffix: 'jaar'
      }, {
        label: 'Rendement',
        value: ROI,
        type: 'number',
        precision: 1,
        suffix: '%'
      }];
    }
  }.property('model.company', 'model.system'),

  sdeData: function() {
    const sdePhase = this.get('model.system.sdePhase');
    const sdeBaseAmount = this.get('sdeBaseAmount');
    const apxPrice = this.get('model.system.apxPrice');
    const sdeContribution = this.get('sdeContribution');
    const sdeLifeContribution = this.get('sdeLifeContribution');

    return [{
      label: 'Inschrijffase',
      value: sdePhase
    }, {
      label: 'Basisbedrag',
      value: sdeBaseAmount,
      type: 'currency',
      precision: 3,
      suffix: 'per kWh'
    }, {
      label: 'APX energieprijs',
      value: apxPrice,
      type: 'currency',
      precision: 3,
      suffix: 'per kWh'
    }, {
      label: 'SDE+ bijdrage',
      value: sdeContribution,
      type: 'currency',
      precision: 3,
      suffix: 'per kWh'
    }, {
      label: 'SDE+ bijdrage over 15 jaar',
      value: sdeLifeContribution,
      type: 'currency'
    }];
  }.property('model.company', 'model.system'),

  eiaData: function() {
    const grossInvestment = this.get('grossInvestment');
    const connection = this.get('model.company.connection');
    const systemPower = this.get('systemPower');
    let eiaPercentage = 0;
    if (connection === 'Aansluiting kleiner dan of gelijk aan 3x80A' &&
      systemPower > 25000 && grossInvestment > 2300) {
      eiaPercentage = 0.58;
    }

    const EIA = this.get('EIA');

    return [{
      label: 'Percentage aftrekbaar',
      value: eiaPercentage * 100,
      type: 'number',
      suffix: '%'
    }, {
      label: 'Bruto investering excl. BTW',
      value: grossInvestment,
      type: 'currency'
    }, {
      label: 'EIA aftrek 2015',
      value: EIA,
      type: 'currency'
    }];
  }.property('model.company', 'model.system'),

  kiaData: function() {
    const otherInvestments = this.get('model.company.otherInvestments');
    const grossInvestment = this.get('grossInvestment');
    const totalInvestment = grossInvestment + otherInvestments;
    const KIA = this.get('KIA');
    const solarKIA = this.get('solarKIA');

    let investmentCategory;
    let taxRule;
    if (totalInvestment <= 2300) {
      investmentCategory = '€ 0 - € 2.300';
      taxRule = 'niets aftrekbaar';
    }
    else if (totalInvestment <= 55248) {
      investmentCategory = '€ 2.300 - € 55.248';
      taxRule = '28% van bruto investering aftrekbaar';
    }
    else if (totalInvestment <= 102311) {
      investmentCategory = '€ 55.248 - € 102.311';
      taxRule = '€ 15.470 aftrekbaar';
    }
    else if (totalInvestment <= 306931) {
      investmentCategory = '€ 102.311 - € 306.931';
      taxRule = '€ 15.470 aftrekbaar - 7,56% investering > € 102.311';
    }
    else if (totalInvestment > 306931) {
      investmentCategory = 'meer dan € 306.931';
      taxRule = 'niets aftrekbaar';
    }

    return [{
      label: 'Overige investeringen',
      value: otherInvestments,
      type: 'currency'
    }, {
      label: 'Investing in zonnepanelen',
      value: grossInvestment,
      type: 'currency'
    }, {
      label: 'Totale investeringen',
      value: totalInvestment,
      type: 'currency'
    },{
      label: 'Investeringscategorie',
      value: investmentCategory
    }, {
      label: 'Belastingregel',
      value: taxRule
    }, {
      label: 'KIA aftrek 2015',
      value: KIA,
      type: 'currency'
    }, {
      label: 'KIA aftrek zonnepanelen',
      value: solarKIA,
      type: 'currency'
    }];
  }.property('model.company', 'model.system'),

  initialDepreciationPercentage: 0.1,

  depreciationData: function() {
    const totalDepreciation = this.get('grossInvestment');
    const initialDepreciationPercentage = this.get('initialDepreciationPercentage');
    const initialDepreciation = totalDepreciation * initialDepreciationPercentage;
    const restDepreciation = totalDepreciation - initialDepreciation;

    return [{
      label: 'Afschrijving 2015 (10%)',
      value: initialDepreciation,
      type: 'currency'
    }, {
      label: 'Afschrijving 2016-2024 (90%)',
      value: restDepreciation,
      type: 'currency'
    }];
  }.property('model.company', 'model.system'),

  taxDeductionData: function() {
    const EIA = this.get('EIA');
    const solarKIA = this.get('solarKIA');
    const grossInvestment = this.get('grossInvestment');
    const initialDepreciationPercentage = this.get('initialDepreciationPercentage');
    const initialTaxDeduction = EIA + solarKIA + grossInvestment * initialDepreciationPercentage;
    const restTaxDeduction = grossInvestment * (1 - initialDepreciationPercentage);
    const taxRate = this.get('taxRate');
    const initialFiscalAdvantage = initialTaxDeduction * taxRate;
    const restFiscalAdvantage = restTaxDeduction * taxRate;
    const totalFiscalAdvantage = initialFiscalAdvantage + restFiscalAdvantage;

    return [{
      label: 'Totaal aftrekposten 2015',
      value: initialTaxDeduction,
      type: 'currency'
    }, {
      label: 'Totaal aftrekposten 2016-2024',
      value: restTaxDeduction,
      type: 'currency'
    }, {
      label: 'Belastingtarief',
      value: taxRate * 100,
      type: 'number',
      precision: 0,
      suffix: '%'
    }, {
      label: 'Fiscaal voordeel 2015',
      value: initialFiscalAdvantage,
      type: 'currency'
    }, {
      label: 'Fiscaal voordeel 2016-2024',
      value: restFiscalAdvantage,
      type: 'currency'
    }, {
      label: 'Netto fiscaal voordeel',
      value: totalFiscalAdvantage,
      type: 'currency'
    }];
  }.property('model.company', 'model.system'),

  revenueData: function() {
    const roofOrientation = this.get('model.system.roofOrientation');
    const roofSlope = this.get('model.system.roofSlope');
    const roofOrientationFactor = this.get('roofOrientationFactor');
    const energyProduction = this.get('energyProduction');
    return [{
      label: 'Orientatie',
      value: roofOrientation
    }, {
      label: 'Hellingshoek',
      value: roofSlope
    }, {
      label: 'Orientatiefactor',
      value: roofOrientationFactor,
      type: 'number',
      suffix: '%'
    }, {
      label: 'Elektriciteitsproductie',
      value: energyProduction,
      type: 'number',
      precision: 0,
      suffix: 'kWh/jaar'
    }];
  }.property('model.company', 'model.system'),

  // roofOrientationFactor for lack of a better solution
  roofOrientationFactor: function() {
    const roofOrientation = this.get('model.system.roofOrientation');
    const roofSlope = this.get('model.system.roofSlope');
    let roofOrientationFactor = 87;
    switch (roofOrientation) {
      case 'O':
        switch (roofSlope) {
          case 0:
            roofOrientationFactor = 87;
            break;
          case 5:
            roofOrientationFactor = 89;
            break;
          case 10:
            roofOrientationFactor = 90;
            break;
          case 15:
            roofOrientationFactor = 89;
            break;
          case 20:
            roofOrientationFactor = 88;
            break;
          case 25:
            roofOrientationFactor = 87;
            break;
          case 30:
            roofOrientationFactor = 86;
            break;
          case 35:
            roofOrientationFactor = 85;
            break;
          case 40:
            roofOrientationFactor = 84;
            break;
          case 45:
            roofOrientationFactor = 82;
            break;
          case 50:
            roofOrientationFactor = 80;
            break;
          case 55:
            roofOrientationFactor = 78;
            break;
          case 60:
            roofOrientationFactor = 78;
            break;
          case 65:
            roofOrientationFactor = 73;
            break;
          case 70:
            roofOrientationFactor = 70;
            break;
          case 75:
            roofOrientationFactor = 68;
            break;
          case 80:
            roofOrientationFactor = 65;
            break;
          case 85:
            roofOrientationFactor = 62;
            break;
          case 90:
            roofOrientationFactor = 58;
            break;
        }
        break;
      case 'ZOO':
        switch (roofSlope) {
          case 0:
            roofOrientationFactor = 87;
            break;
          case 5:
            roofOrientationFactor = 91;
            break;
          case 10:
            roofOrientationFactor = 93;
            break;
          case 15:
            roofOrientationFactor = 93;
            break;
          case 20:
            roofOrientationFactor = 93;
            break;
          case 25:
            roofOrientationFactor = 93;
            break;
          case 30:
            roofOrientationFactor = 93;
            break;
          case 35:
            roofOrientationFactor = 92;
            break;
          case 40:
            roofOrientationFactor = 91;
            break;
          case 45:
            roofOrientationFactor = 89;
            break;
          case 50:
            roofOrientationFactor = 88;
            break;
          case 55:
            roofOrientationFactor = 86;
            break;
          case 60:
            roofOrientationFactor = 85;
            break;
          case 65:
            roofOrientationFactor = 82;
            break;
          case 70:
            roofOrientationFactor = 79;
            break;
          case 75:
            roofOrientationFactor = 76;
            break;
          case 80:
            roofOrientationFactor = 73;
            break;
          case 85:
            roofOrientationFactor = 68;
            break;
          case 90:
            roofOrientationFactor = 64;
            break;
        }
        break;
      case 'ZO':
        switch (roofSlope) {
          case 0:
            roofOrientationFactor = 87;
            break;
          case 5:
            roofOrientationFactor = 91;
            break;
          case 10:
            roofOrientationFactor = 93;
            break;
          case 15:
            roofOrientationFactor = 93;
            break;
          case 20:
            roofOrientationFactor = 93;
            break;
          case 25:
            roofOrientationFactor = 93;
            break;
          case 30:
            roofOrientationFactor = 93;
            break;
          case 35:
            roofOrientationFactor = 92;
            break;
          case 40:
            roofOrientationFactor = 91;
            break;
          case 45:
            roofOrientationFactor = 89;
            break;
          case 50:
            roofOrientationFactor = 88;
            break;
          case 55:
            roofOrientationFactor = 86;
            break;
          case 60:
            roofOrientationFactor = 85;
            break;
          case 65:
            roofOrientationFactor = 82;
            break;
          case 70:
            roofOrientationFactor = 79;
            break;
          case 75:
            roofOrientationFactor = 76;
            break;
          case 80:
            roofOrientationFactor = 73;
            break;
          case 85:
            roofOrientationFactor = 68;
            break;
          case 90:
            roofOrientationFactor = 64;
            break;
        }
        break;
      case 'ZZO':
        switch (roofSlope) {
          case 0:
            roofOrientationFactor = 87;
            break;
          case 5:
            roofOrientationFactor = 91;
            break;
          case 10:
            roofOrientationFactor = 95;
            break;
          case 15:
            roofOrientationFactor = 97;
            break;
          case 20:
            roofOrientationFactor = 98;
            break;
          case 25:
            roofOrientationFactor = 99;
            break;
          case 30:
            roofOrientationFactor = 100;
            break;
          case 35:
            roofOrientationFactor = 100;
            break;
          case 40:
            roofOrientationFactor = 99;
            break;
          case 45:
            roofOrientationFactor = 98;
            break;
          case 50:
            roofOrientationFactor = 97;
            break;
          case 55:
            roofOrientationFactor = 95;
            break;
          case 60:
            roofOrientationFactor = 93;
            break;
          case 65:
            roofOrientationFactor = 90;
            break;
          case 70:
            roofOrientationFactor = 87;
            break;
          case 75:
            roofOrientationFactor = 84;
            break;
          case 80:
            roofOrientationFactor = 80;
            break;
          case 85:
            roofOrientationFactor = 76;
            break;
          case 90:
            roofOrientationFactor = 71;
            break;
        }
        break;
      case 'Z':
        switch (roofSlope) {
          case 0:
            roofOrientationFactor = 87;
            break;
          case 5:
            roofOrientationFactor = 92;
            break;
          case 10:
            roofOrientationFactor = 96;
            break;
          case 15:
            roofOrientationFactor = 97;
            break;
          case 20:
            roofOrientationFactor = 98;
            break;
          case 25:
            roofOrientationFactor = 99;
            break;
          case 30:
            roofOrientationFactor = 100;
            break;
          case 35:
            roofOrientationFactor = 100;
            break;
          case 40:
            roofOrientationFactor = 100;
            break;
          case 45:
            roofOrientationFactor = 99;
            break;
          case 50:
            roofOrientationFactor = 97;
            break;
          case 55:
            roofOrientationFactor = 95;
            break;
          case 60:
            roofOrientationFactor = 93;
            break;
          case 65:
            roofOrientationFactor = 90;
            break;
          case 70:
            roofOrientationFactor = 87;
            break;
          case 75:
            roofOrientationFactor = 84;
            break;
          case 80:
            roofOrientationFactor = 80;
            break;
          case 85:
            roofOrientationFactor = 76;
            break;
          case 90:
            roofOrientationFactor = 71;
            break;
        }
        break;
      case 'ZZW':
        switch (roofSlope) {
          case 0:
            roofOrientationFactor = 87;
            break;
          case 5:
            roofOrientationFactor = 91;
            break;
          case 10:
            roofOrientationFactor = 95;
            break;
          case 15:
            roofOrientationFactor = 97;
            break;
          case 20:
            roofOrientationFactor = 98;
            break;
          case 25:
            roofOrientationFactor = 98;
            break;
          case 30:
            roofOrientationFactor = 98;
            break;
          case 35:
            roofOrientationFactor = 98;
            break;
          case 40:
            roofOrientationFactor = 98;
            break;
          case 45:
            roofOrientationFactor = 97;
            break;
          case 50:
            roofOrientationFactor = 95;
            break;
          case 55:
            roofOrientationFactor = 93;
            break;
          case 60:
            roofOrientationFactor = 90;
            break;
          case 65:
            roofOrientationFactor = 88;
            break;
          case 70:
            roofOrientationFactor = 85;
            break;
          case 75:
            roofOrientationFactor = 82;
            break;
          case 80:
            roofOrientationFactor = 78;
            break;
          case 85:
            roofOrientationFactor = 74;
            break;
          case 90:
            roofOrientationFactor = 70;
        }
        break;
      case 'ZW':
        switch (roofSlope) {
          case 0:
            roofOrientationFactor = 87;
            break;
          case 5:
            roofOrientationFactor = 91;
            break;
          case 10:
            roofOrientationFactor = 94;
            break;
          case 15:
            roofOrientationFactor = 95;
            break;
          case 20:
            roofOrientationFactor = 96;
            break;
          case 25:
            roofOrientationFactor = 96;
            break;
          case 30:
            roofOrientationFactor = 96;
            break;
          case 35:
            roofOrientationFactor = 96;
            break;
          case 40:
            roofOrientationFactor = 95;
            break;
          case 45:
            roofOrientationFactor = 94;
            break;
          case 50:
            roofOrientationFactor = 92;
            break;
          case 55:
            roofOrientationFactor = 90;
            break;
          case 60:
            roofOrientationFactor = 87;
            break;
          case 65:
            roofOrientationFactor = 85;
            break;
          case 70:
            roofOrientationFactor = 82;
            break;
          case 75:
            roofOrientationFactor = 79;
            break;
          case 80:
            roofOrientationFactor = 75;
            break;
          case 85:
            roofOrientationFactor = 71;
            break;
          case 90:
            roofOrientationFactor = 67;
            break;
        }
        break;
      case 'ZWW':
        switch (roofSlope) {
          case 0:
            roofOrientationFactor = 87;
            break;
          case 5:
            roofOrientationFactor = 89;
            break;
          case 10:
            roofOrientationFactor = 91;
            break;
          case 15:
            roofOrientationFactor = 92;
            break;
          case 20:
            roofOrientationFactor = 91;
            break;
          case 25:
            roofOrientationFactor = 91;
            break;
          case 30:
            roofOrientationFactor = 90;
            break;
          case 35:
            roofOrientationFactor = 89;
            break;
          case 40:
            roofOrientationFactor = 87;
            break;
          case 45:
            roofOrientationFactor = 86;
            break;
          case 50:
            roofOrientationFactor = 85;
            break;
          case 55:
            roofOrientationFactor = 83;
            break;
          case 60:
            roofOrientationFactor = 81;
            break;
          case 65:
            roofOrientationFactor = 78;
            break;
          case 70:
            roofOrientationFactor = 75;
            break;
          case 75:
            roofOrientationFactor = 72;
            break;
          case 80:
            roofOrientationFactor = 69;
            break;
          case 85:
            roofOrientationFactor = 65;
            break;
          case 90:
            roofOrientationFactor = 61;
            break;
        }
        break;
      case 'W':
        switch (roofSlope) {
          case 0:
            roofOrientationFactor = 87;
            break;
          case 5:
            roofOrientationFactor = 88;
            break;
          case 10:
            roofOrientationFactor = 89;
            break;
          case 15:
            roofOrientationFactor = 88;
            break;
          case 20:
            roofOrientationFactor = 87;
            break;
          case 25:
            roofOrientationFactor = 87;
            break;
          case 30:
            roofOrientationFactor = 86;
            break;
          case 35:
            roofOrientationFactor = 84;
            break;
          case 40:
            roofOrientationFactor = 82;
            break;
          case 45:
            roofOrientationFactor = 80;
            break;
          case 50:
            roofOrientationFactor = 78;
            break;
          case 55:
            roofOrientationFactor = 76;
            break;
          case 60:
            roofOrientationFactor = 74;
            break;
          case 65:
            roofOrientationFactor = 72;
            break;
          case 70:
            roofOrientationFactor = 69;
            break;
          case 75:
            roofOrientationFactor = 66;
            break;
          case 80:
            roofOrientationFactor = 63;
            break;
          case 85:
            roofOrientationFactor = 60;
            break;
          case 90:
            roofOrientationFactor = 57;
            break;
        }
        break;
    }
    return roofOrientationFactor;
  }.property()

});
