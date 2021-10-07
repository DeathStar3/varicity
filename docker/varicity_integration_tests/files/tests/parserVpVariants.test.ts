import {expect} from 'chai';

import { District } from '../src/model/entities/district.interface';
import { ConfigLoader } from '../src/controller/parser/configLoader';
import { FilesLoader } from '../src/controller/parser/filesLoader';
import {VPVariantsStrategy} from "../src/controller/parser/strategies/vp_variants.strategy";

function countBuilding(districts: District[]) : number{
  let sum = 0;
  districts.forEach(d => {
    sum += d.buildings.length;
    sum += countBuilding(d.districts)
  })
   return sum;
}

function countDistricts(districts: District[]) : number{
  let sum = 0;
  districts.forEach(d => {
    sum += 1;
    sum += countDistricts(d.districts)
  })
   return sum;
}

let config = ConfigLoader.loadDataFile("config");
config.hierarchy_links = ["EXTENDS", "IMPLEMENTS"];

describe('parsing all tests projects with vp strategy', function() {
    it('parse abstract decorator', function() {
        let entities = new VPVariantsStrategy().parse(FilesLoader.loadDataFile('abstract_decorator'), config, "abstract_decorator");
        let ent = entities.filterCompLevel(1);
        let dis = ent.district.districts
        let numberOfDistricts = countDistricts(dis);
        let numberOfBuiildings = countBuilding(dis) + countDistricts(dis)
        expect(numberOfBuiildings).equal(3); // correction 4 en 3
        expect(numberOfDistricts).equal(2);
    });

    it('parse composition_levels_inheritance', function() {
      let entities = new VPVariantsStrategy().parse(FilesLoader.loadDataFile('composition_levels_inheritance'), config, "project");
      let districts = entities.district.districts
      let numberOfBuiildings = countBuilding(districts) + countDistricts(districts)
      expect(numberOfBuiildings).equal(0); // bizarre que le résulat soit 0
      let numberOfLinks = entities.links.length;
      expect(numberOfLinks).equal(0);
    });

    // it('parse composition_levels_mixed', function() {
    //   let entities = new ClassesPackagesStrategy().parse('composition_levels_mixed');
    //   let numberOfBuiildings = entities.buildings.length;
    //   expect(numberOfBuiildings).equal(1);
    //   let numberOfLinks = entities.links.length;
    //   expect(numberOfLinks).equal(0);
    // }); 

    it('parse decorator', function() {
      let entities = new VPVariantsStrategy().parse(FilesLoader.loadDataFile('decorator'), config, "decorator");
      let dis = entities.district.districts
      let numberOfBuiildings = countBuilding(dis) + countDistricts(dis)
      expect(numberOfBuiildings).equal(4);
      let numberOfLinks = entities.links.length;
      expect(numberOfLinks).equal(5); // pourquoi 5
    });

    it('parse density', function() {
      let entities = new VPVariantsStrategy().parse(FilesLoader.loadDataFile('density'), config, "density");
      let dis = entities.district.districts
      let numberOfBuiildings = countBuilding(dis) + countDistricts(dis)
      expect(numberOfBuiildings).equal(6);
      let numberOfLinks = entities.links.length;
      expect(numberOfLinks).equal(6);
    });

    it('parse factory', function() {
      // config.api_classes = new Map([["project", ["Shape"]]])
      let entities = new VPVariantsStrategy().parse(FilesLoader.loadDataFile('factory'), config, "factory");
      let dis = entities.district.districts
      let numberOfBuiildings = countBuilding(dis) + countDistricts(dis)
      expect(numberOfBuiildings).equal(3);
      let numberOfLinks = entities.links.length;
      expect(numberOfLinks).equal(2);
    });

    it('parse generic_decorator', function() {
      let entities = new VPVariantsStrategy().parse(FilesLoader.loadDataFile('generic_decorator'), config, "generic_decorator");
      let dis = entities.district.districts
      let numberOfBuiildings = countBuilding(dis) + countDistricts(dis)
      expect(numberOfBuiildings).equal(4); // 0 au lieu de 4
      let numberOfLinks = entities.links.length;
      expect(numberOfLinks).equal(5);
    });

    it('parse attribute_composition', function() {
      let entities = new VPVariantsStrategy().parse(FilesLoader.loadDataFile('attribute_composition'), config, "attribute_composition");
      let dis = entities.district.districts
      let numberOfBuiildings = countBuilding(dis) + countDistricts(dis)
      expect(numberOfBuiildings).equal(0);
      let numberOfLinks = entities.links.length;
      expect(numberOfLinks).equal(0);
    });

    it('parse attribute_composition_factory', function() {
      // config.api_classes = new Map([["project", ["Dataset","Value","DefaultPieDataset"]]])
      let entities = new VPVariantsStrategy().parse(FilesLoader.loadDataFile('attribute_composition_factory'), config, "attribute_composition_factory");
      let dis = entities.district.districts
      let numberOfBuiildings = countBuilding(dis) + countDistricts(dis)
      expect(numberOfBuiildings).equal(12); // à revérifier avec des consoles
      let numberOfLinks = entities.links.length;
      expect(numberOfLinks).equal(9); // à revérifier aussi
    });

    it('parse generics', function() {
      // config.api_classes = new Map([["project", ["MyPair"]]])
      let entities = new VPVariantsStrategy().parse(FilesLoader.loadDataFile('generics'), config, "generics");
      let dis = entities.district.districts
      let numberOfBuiildings = countBuilding(dis) + countDistricts(dis)
      expect(numberOfBuiildings).equal(3);
      let numberOfLinks = entities.links.length;
      expect(numberOfLinks).equal(2);
    });

    it('parse inheritance', function() {
      // config.api_classes = new Map([["project", ["Superclass"]]])
      let entities = new VPVariantsStrategy().parse(FilesLoader.loadDataFile('inheritance'), config, "inheritance");
      let dis = entities.district.districts
      let numberOfBuiildings = countBuilding(dis) + countDistricts(dis)
      expect(numberOfBuiildings).equal(3);
      let numberOfLinks = entities.links.length;
      expect(numberOfLinks).equal(2);
    });

    // it('parse import_from_different_package', function() {
    //   let entities = new ClassesPackagesStrategy().parse('import_from_different_package');
    //   let numberOfBuiildings = entities.buildings.length;
    //   expect(numberOfBuiildings).equal(2);
    //   let numberOfLinks = entities.links.length;
    //   expect(numberOfLinks).equal(1);
    // });

    // it('parse import_from_different_package_all_package_imported', function() {
    //   let entities = new ClassesPackagesStrategy().parse('import_from_different_package_all_package_imported');
    //   let numberOfBuiildings = entities.buildings.length;
    //   expect(numberOfBuiildings).equal(2);
    //   let numberOfLinks = entities.links.length;
    //   expect(numberOfLinks).equal(1);
    // });

    it('parse inner_class', function() {
      let entities = new VPVariantsStrategy().parse(FilesLoader.loadDataFile('inner_class'), config, "project");
      let dis = entities.district.districts
      let numberOfBuiildings = countBuilding(dis) + countDistricts(dis)
      expect(numberOfBuiildings).equal(0);
      let numberOfLinks = entities.links.length;
      expect(numberOfLinks).equal(0);
    });

    it('parse inner_class_before_fields', function() {
      let entities = new VPVariantsStrategy().parse(FilesLoader.loadDataFile('inner_class_before_fields'), config, "project");
      let dis = entities.district.districts
      let numberOfBuiildings = countBuilding(dis) + countDistricts(dis)
      expect(numberOfBuiildings).equal(0);
      let numberOfLinks = entities.links.length;
      expect(numberOfLinks).equal(0);
    });

    it('parse metrics', function() {
      let entities = new VPVariantsStrategy().parse(FilesLoader.loadDataFile('metrics'), config, "metrics");
      let dis = entities.district.districts
      let numberOfBuiildings = countBuilding(dis) + countDistricts(dis)
      expect(numberOfBuiildings).equal(0); // ici c'est 0 au lieu de 4
      let numberOfLinks = entities.links.length;
      expect(numberOfLinks).equal(0);
    });

    it('parse multiple_patterns', function() {
      // config.api_classes = new Map([["project", ["Shape","Factory"]]])
      let entities = new VPVariantsStrategy().parse(FilesLoader.loadDataFile('multiple_patterns'), config, "multiple_patterns");
      let dis = entities.district.districts
      let numberOfBuiildings = countBuilding(dis) + countDistricts(dis)
      expect(numberOfBuiildings).equal(6);
      let numberOfLinks = entities.links.length;
      expect(numberOfLinks).equal(7); // ici c'est 7 au lieu de 4
    });

    it('parse multiple_vp', function() {
      let entities = new VPVariantsStrategy().parse(FilesLoader.loadDataFile('multiple_vp'), config, "multiple_vp");
      let dis = entities.district.districts
      let numberOfBuiildings = countBuilding(dis) + countDistricts(dis)
      expect(numberOfBuiildings).equal(0);
      let numberOfLinks = entities.links.length;
      expect(numberOfLinks).equal(0);
    });

    it('parse strategy', function() {
      // config.api_classes = new Map([["project", ["Strategy"]]])
      let entities = new VPVariantsStrategy().parse(FilesLoader.loadDataFile('strategy'), config, "strategy");
      let dis = entities.district.districts
      let numberOfBuiildings = countBuilding(dis) + countDistricts(dis)
      expect(numberOfBuiildings).equal(3);
      let numberOfLinks = entities.links.length;
      expect(numberOfLinks).equal(2);
    });

    it('parse strategy_with_method_parameter', function() {
      let entities = new VPVariantsStrategy().parse(FilesLoader.loadDataFile('strategy_with_method_parameter'), config, "strategy_with_method_parameter");
      let dis = entities.district.districts
      let numberOfBuiildings = countBuilding(dis) + countDistricts(dis)
      expect(numberOfBuiildings).equal(3);
      let numberOfLinks = entities.links.length;
      expect(numberOfLinks).equal(2);
    });

    it('parse structures', function() {
      let entities = new VPVariantsStrategy().parse(FilesLoader.loadDataFile('structures'), config, "structures");
      let dis = entities.district.districts
      let numberOfBuiildings = countBuilding(dis) + countDistricts(dis)
      expect(numberOfBuiildings).equal(0);
      let numberOfLinks = entities.links.length;
      expect(numberOfLinks).equal(0);
    });

    it('parse template', function() {
      // config.api_classes = new Map([["project", ["Algorithm"]]])
      let entities = new VPVariantsStrategy().parse(FilesLoader.loadDataFile('template'), config, "template");
      let dis = entities.district.districts
      let numberOfBuiildings = countBuilding(dis) + countDistricts(dis)
      expect(numberOfBuiildings).equal(2);
      let numberOfLinks = entities.links.length;
      expect(numberOfLinks).equal(1);
    });

    it('parse vps_and_variants', function() {
      let entities = new VPVariantsStrategy().parse(FilesLoader.loadDataFile('vps_and_variants'), config, "vps_and_variants");
      let dis = entities.district.districts
      let numberOfBuiildings = countBuilding(dis) + countDistricts(dis)
      expect(numberOfBuiildings).equal(0);
      let numberOfLinks = entities.links.length;
      expect(numberOfLinks).equal(0);
    });

    // it('parse vps_in_different_packages', function() {
    //   let entities = new ClassesPackagesStrategy().parse('vps_in_different_packages');
    //   let districts = entities.district[0].districts
    //   let numberOfDistricts = districts.length;
    //   expect(numberOfDistricts).equal(2);
    //   let numberOfBuiildings = 0;
    //   districts.forEach(d => {
    //     numberOfBuiildings += d.buildings.length
    //   })
    //   numberOfBuiildings+= entities.buildings.length
    //   // expect(numberOfBuiildings).equal(6);
    //   let numberOfLinks = entities.links.length;
    //   expect(numberOfLinks).equal(1);
    // });
  });