using {
  cuid,
  managed,
  sap
} from '@sap/cds/common';

namespace my.bookshop;

entity Books : cuid, managed {
  title  : String;
  stock  : Integer;
  author : Association to Authors;
  genre  : Association to Genres;
}

entity Authors : cuid, managed {
  name  : String(111);
}

entity Genres : sap.common.CodeList {
  key ID       : Integer;
      parent   : Association to Genres;
      children : Composition of many Genres
                   on children.parent = $self;
}
