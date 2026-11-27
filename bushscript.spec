Name:           bushscript
Version:        0.95
Release:        1%{?dist}
Summary:        BushScript - a lightweight scripting language

License:        MIT
URL:            https://github.com/Arsromnov/BushScript
Source0:        %{name}-%{version}.tar.gz

BuildArch:      noarch

%description
BushScript is a small, embeddable scripting language with a simple
syntax (variables, if/else, while, functions, imports) and an
extendable standard library written in JavaScript.

%prep
%setup -q

%build

%install
install -d -m 0755 %{buildroot}%{_bindir}
install -m 0755 bsh %{buildroot}%{_bindir}/bsh

install -d -m 0755 %{buildroot}%{_datadir}/bushscript/std
install -m 0644 src/std/*.js %{buildroot}%{_datadir}/bushscript/std/

install -d -m 0755 %{buildroot}%{_docdir}/%{name}
install -m 0644 docs/*.md %{buildroot}%{_docdir}/%{name}/
install -m 0644 docs/modules/*.md %{buildroot}%{_docdir}/%{name}/modules/ 2>/dev/null || :

%check

%files
%{_bindir}/bsh
%{_datadir}/bushscript/std/*.js
%doc docs/*
%license LICENSE

%changelog
### 0.95 
thx to @oversouth for his contribution to the development
> - core optimization
> - functions can now return values ​​and be used as methods
> - minor changes
> - documentation rewrite
> - add build script for linux
