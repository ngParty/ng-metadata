// 3rd party dependencies
import 'reflect-metadata';

// Load test files
import './core/change_detection/changes_queue.spec';
import './core/change_detection/change_detection_util.spec';
import './core/di/decorators.spec';
import './core/di/provider.spec';
import './core/di/reflective_provider.spec';
import './core/di/key.spec';
import './core/di/forward_ref.spec';
import './core/util/decorators.spec';
import './core/util/bundler.spec';
import './core/reflection/reflection.spec';
import './core/linker/pipe_resolver.spec';
import './core/pipes/pipe_provider.spec';
import './core/linker/directive_lifecycles_reflector.spec';
import './core/linker/directive_resolver.spec';
import './core/directives/directive_provider.spec';
import './core/directives/directives_utils.spec';
import './core/directives/binding/binding_factory.spec';
import './core/directives/binding/binding_parser.spec';
import './core/directives/controller/controller_factory.spec';
import './core/directives/host/host_parser.spec';
import './core/directives/host/host_resolver.spec';
import './core/directives/query/children_resolver.spec';

import './facade/lang.spec';
import './facade/primitives.spec';
import './facade/collections.spec';
import './facade/async.spec';

import './common/pipes/async_pipe.spec';

import './upgrade/upgrade_adapter.spec';
import './upgrade/static/upgrade_injectable.spec';
import './upgrade/static/downgrade_injectable.spec';
import './upgrade/static/downgrade_component.spec';

describe( 'ng-metadata', ()=> {} );
