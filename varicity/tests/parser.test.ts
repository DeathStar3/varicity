import {expect} from 'chai';

import { ClassesPackagesStrategy } from "../src/controller/parser/strategies/classes_packages.strategy";
import {FilesLoader} from "../src/controller/parser/filesLoader";
import {ConfigLoader} from "../src/controller/parser/configLoader";

describe('parsing without links', function() {
  it('parse', function() {
    let entities = new ClassesPackagesStrategy().parse(FilesLoader.loadDataFile('test1WithoutLinks'), ConfigLoader.loadDataFile("config"));
    let districts = entities.district.districts[0].districts[0].districts
    let numberOfDistricts = districts.length;
    expect(numberOfDistricts).equal(2);
    let numberOfBuildings = 0;
    districts.forEach(d => {
      numberOfBuildings += d.buildings.length
    })
    expect(numberOfBuildings).equal(5);
  }); 
});

describe('parsing links', function() {
  it('parse', function() {
    let entities = new ClassesPackagesStrategy().parse(FilesLoader.loadDataFile('test2WithLinks'), ConfigLoader.loadDataFile("config"));
    let numberOfLinks = entities.links.length;
    expect(numberOfLinks).equal(2);
  }); 
});