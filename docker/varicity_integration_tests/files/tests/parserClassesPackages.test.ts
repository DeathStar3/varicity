import {expect} from 'chai';

import { ClassesPackagesStrategy } from "../src/controller/parser/strategies/classes_packages.strategy";
import { District } from '../src/model/entities/district.interface';
import { ConfigLoader } from '../src/controller/parser/configLoader';
import { FilesLoader } from '../src/controller/parser/filesLoader';

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

describe('parsing all tests projects with classe packages strategy', function() {
  it('parse abactract decorator', function() {
    let entities = new ClassesPackagesStrategy().parse(FilesLoader.loadDataFile('abstract_decorator'), ConfigLoader.loadDataFile("config"));
    let numberOfBuiildings = entities.buildings.length;
    expect(numberOfBuiildings).equal(4);
    let numberOfLinks = entities.links.length;
    expect(numberOfLinks).equal(3);
  }); 

  it('parse composition_levels_inheritance', function() {
    let entities = new ClassesPackagesStrategy().parse(FilesLoader.loadDataFile('composition_levels_inheritance'), ConfigLoader.loadDataFile("config")); 
    let numberOfBuiildings = entities.buildings.length;
    expect(numberOfBuiildings).equal(1);
    let numberOfLinks = entities.links.length;
    expect(numberOfLinks).equal(0);
  }); 

  it('parse composition_levels_mixed', function() {
    let entities = new ClassesPackagesStrategy().parse(FilesLoader.loadDataFile('composition_levels_mixed'), ConfigLoader.loadDataFile("config")); 
    let numberOfBuiildings = entities.buildings.length;
    expect(numberOfBuiildings).equal(1);
    let numberOfLinks = entities.links.length;
    expect(numberOfLinks).equal(0);
  }); 

  it('parse decorator', function() {
    let entities = new ClassesPackagesStrategy().parse(FilesLoader.loadDataFile('decorator'), ConfigLoader.loadDataFile("config"));
    let districts = entities.district.districts[0].districts
    let numberOfBuiildings = countBuilding(districts)
    expect(numberOfBuiildings).equal(4);
    let numberOfLinks = entities.links.length;
    expect(numberOfLinks).equal(3);
  }); 

  it('parse density', function() {
    let entities = new ClassesPackagesStrategy().parse(FilesLoader.loadDataFile('density'), ConfigLoader.loadDataFile("config"));
    let numberOfBuiildings = entities.buildings.length;
    expect(numberOfBuiildings).equal(6);
    let numberOfLinks = entities.links.length;
    expect(numberOfLinks).equal(4);
  });

  it('parse factory', function() {
    let entities = new ClassesPackagesStrategy().parse(FilesLoader.loadDataFile('factory'), ConfigLoader.loadDataFile("config"));
    let numberOfBuiildings = entities.buildings.length;
    expect(numberOfBuiildings).equal(4);
    let numberOfLinks = entities.links.length;
    expect(numberOfLinks).equal(2);
  });

  it('parse generic_decorator', function() {
    let entities = new ClassesPackagesStrategy().parse(FilesLoader.loadDataFile('generic_decorator'), ConfigLoader.loadDataFile("config"));
    let numberOfBuiildings = entities.buildings.length;
    expect(numberOfBuiildings).equal(4);
    let numberOfLinks = entities.links.length;
    expect(numberOfLinks).equal(3);
  });

  it('parse attribute_composition', function() {
    let entities = new ClassesPackagesStrategy().parse(FilesLoader.loadDataFile('attribute_composition'), ConfigLoader.loadDataFile("config"));
    let numberOfBuiildings = entities.buildings.length;
    expect(numberOfBuiildings).equal(1);
    let numberOfLinks = entities.links.length;
    expect(numberOfLinks).equal(0);
  });

  it('parse attribute_composition_factory', function() {
    let entities = new ClassesPackagesStrategy().parse(FilesLoader.loadDataFile('attribute_composition_factory'), ConfigLoader.loadDataFile("config"));
    let numberOfBuiildings = entities.buildings.length;
    expect(numberOfBuiildings).equal(10);
    let numberOfLinks = entities.links.length;
    expect(numberOfLinks).equal(9);
  });

  it('parse generics', function() {
    let entities = new ClassesPackagesStrategy().parse(FilesLoader.loadDataFile('generics'), ConfigLoader.loadDataFile("config"));
    let numberOfBuiildings = entities.buildings.length;
    expect(numberOfBuiildings).equal(3);
    let numberOfLinks = entities.links.length;
    expect(numberOfLinks).equal(2);
  });

  it('parse inheritance', function() {
    let entities = new ClassesPackagesStrategy().parse(FilesLoader.loadDataFile('inheritance'), ConfigLoader.loadDataFile("config"));
    let numberOfBuiildings = entities.buildings.length;
    expect(numberOfBuiildings).equal(3);
    let numberOfLinks = entities.links.length;
    expect(numberOfLinks).equal(2);
  });

  // it('parse import_from_different_package_all_package_imported', function() {
  //   let entities = new ClassesPackagesStrategy().parse('import_from_different_package_all_package_imported');
  //   let districts = entities.district.districts[0].districts
  //   let numberOfBuiildings = countBuilding(districts)
  //   expect(numberOfBuiildings).equal(2);
  //   let numberOfLinks = entities.links.length;
  //   expect(numberOfLinks).equal(1);
  // });

  it('parse inner_class', function() {
    let entities = new ClassesPackagesStrategy().parse(FilesLoader.loadDataFile('inner_class'), ConfigLoader.loadDataFile("config"));
    let numberOfBuiildings = entities.buildings.length;
    expect(numberOfBuiildings).equal(0);
    let numberOfLinks = entities.links.length;
    expect(numberOfLinks).equal(0);
  });

  it('parse inner_class_before_fields', function() {
    let entities = new ClassesPackagesStrategy().parse(FilesLoader.loadDataFile('inner_class_before_fields'), ConfigLoader.loadDataFile("config"));
    let numberOfBuiildings = entities.buildings.length;
    expect(numberOfBuiildings).equal(0);
    let numberOfLinks = entities.links.length;
    expect(numberOfLinks).equal(0);
  });

  it('parse metrics', function() {
    let entities = new ClassesPackagesStrategy().parse(FilesLoader.loadDataFile('metrics'), ConfigLoader.loadDataFile("config"));
    let numberOfBuiildings = entities.buildings.length;
    expect(numberOfBuiildings).equal(4);
    let numberOfLinks = entities.links.length;
    expect(numberOfLinks).equal(0);
  });

  it('parse multiple_patterns', function() {
    let entities = new ClassesPackagesStrategy().parse(FilesLoader.loadDataFile('multiple_patterns'), ConfigLoader.loadDataFile("config"));
    let numberOfBuiildings = entities.buildings.length;
    expect(numberOfBuiildings).equal(6);
    let numberOfLinks = entities.links.length;
    expect(numberOfLinks).equal(4);
  });

  it('parse import_from_different_package', function() {
    let entities = new ClassesPackagesStrategy().parse(FilesLoader.loadDataFile('import_from_different_package'), ConfigLoader.loadDataFile("config"));
    let districts = entities.district.districts[0]
    // let districts1 = entities.district
    // console.log('\n\n************\n\n')
    // console.log(districts)
    // console.log('\n\n************\n\n')
    // console.log(districts1)
    let numberOfBuiildings = districts.buildings.length
    expect(numberOfBuiildings).equal(1); // je ne sais pas pourquoi c'est 2 il ne trouve pas le dis de impl
    let numberOfLinks = entities.links.length;
    expect(numberOfLinks).equal(1);
  });

  it('parse multiple_vp', function() {
    let entities = new ClassesPackagesStrategy().parse(FilesLoader.loadDataFile('multiple_vp'), ConfigLoader.loadDataFile("config"));
    let numberOfBuiildings = entities.buildings.length;
    expect(numberOfBuiildings).equal(1);
    let numberOfLinks = entities.links.length;
    expect(numberOfLinks).equal(0);
  });

  it('parse strategy', function() {
    let entities = new ClassesPackagesStrategy().parse(FilesLoader.loadDataFile('strategy'), ConfigLoader.loadDataFile("config"));
    let numberOfBuiildings = entities.buildings.length;
    expect(numberOfBuiildings).equal(3);
    let numberOfLinks = entities.links.length;
    expect(numberOfLinks).equal(2);
  });

  it('parse strategy_with_method_parameter', function() {
    let entities = new ClassesPackagesStrategy().parse(FilesLoader.loadDataFile('strategy_with_method_parameter'), ConfigLoader.loadDataFile("config"));
    let numberOfBuiildings = entities.buildings.length;
    expect(numberOfBuiildings).equal(3);
    let numberOfLinks = entities.links.length;
    expect(numberOfLinks).equal(2);
  });

  it('parse structures', function() {
    let entities = new ClassesPackagesStrategy().parse(FilesLoader.loadDataFile('structures'), ConfigLoader.loadDataFile("config"));
    let numberOfBuiildings = entities.buildings.length;
    expect(numberOfBuiildings).equal(3);
    let numberOfLinks = entities.links.length;
    expect(numberOfLinks).equal(0);
  });

  it('parse template', function() {
    let entities = new ClassesPackagesStrategy().parse(FilesLoader.loadDataFile('template'), ConfigLoader.loadDataFile("config"));
    let numberOfBuiildings = entities.buildings.length;
    expect(numberOfBuiildings).equal(2);
    let numberOfLinks = entities.links.length;
    expect(numberOfLinks).equal(1);
  });

  it('parse vps_and_variants', function() {
    let entities = new ClassesPackagesStrategy().parse(FilesLoader.loadDataFile('vps_and_variants'), ConfigLoader.loadDataFile("config"));
    let numberOfBuiildings = entities.buildings.length;
    expect(numberOfBuiildings).equal(6);
    let numberOfLinks = entities.links.length;
    expect(numberOfLinks).equal(0);
  });

  it('parse vps_in_different_packages', function() {
    let entities = new ClassesPackagesStrategy().parse(FilesLoader.loadDataFile('vps_in_different_packages'), ConfigLoader.loadDataFile("config"));
    let districts = entities.district.districts
    let numberOfBuiildings = countBuilding(districts) + countDistricts(districts) // à revérifier
    expect(numberOfBuiildings).equal(6);
    let numberOfLinks = entities.links.length;
    expect(numberOfLinks).equal(1);
  });
});