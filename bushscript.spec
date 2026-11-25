Name:           bushscript
Version:        0.95
Release:        1%{?dist}
Summary:        BushScript - a lightweight scripting language

License:        MIT
URL:            https://github.com/Arsromnov/BushScript
Source0:        %{name}-%{version}.tar.gz

BuildArch:      noarch

# BushScript is compiled with QuickJS. This RPM packages the pre-built
# `bsh` binary and stdlib; the actual compilation happens via
# src/build_windows.sh / src/build_linux.sh before packaging.

%description
BushScript is a small, embeddable scripting language with a simple
syntax (variables, if/else, while, functions, imports) and an
extendable standard library written in JavaScript.

%prep
%setup -q

%build
# Nothing to compile here — the `bsh` binary is produced by the
# project's own build scripts (build_linux.sh / build_windows.sh)
# and included in the source tarball.

%install
install -d -m 0755 %{buildroot}%{_bindir}
install -m 0755 bsh %{buildroot}%{_bindir}/bsh

install -d -m 0755 %{buildroot}%{_datadir}/bushscript/std
install -m 0644 src/std/*.js %{buildroot}%{_datadir}/bushscript/std/

install -d -m 0755 %{buildroot}%{_docdir}/%{name}
install -m 0644 docs/*.md %{buildroot}%{_docdir}/%{name}/
install -m 0644 docs/modules/*.md %{buildroot}%{_docdir}/%{name}/modules/ 2>/dev/null || :

%check
# No test suite yet; the binary is smoke-tested by the project itself.

%files
%{_bindir}/bsh
%{_datadir}/bushscript/std/*.js
%doc docs/*
%license LICENSE

%changelog
* Wed Nov 25 2026 Pavel Zaikin <pavel.d.zaikin@gmail.com> - 0.95-1
- Initial RPM package for BushScript 0.95
- Modularized codebase, split build scripts, reworked docs
