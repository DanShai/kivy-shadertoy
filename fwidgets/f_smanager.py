from kivy.app import App
from kivy.properties import AliasProperty, DictProperty, ListProperty
from kivy.uix.screenmanager import Screen, ScreenManager

from .f_widget import FWidget


class FSmanager(ScreenManager, FWidget):

    def __init__(self, **kwargs):

        super(FSmanager, self).__init__(**kwargs)


class NormalScreen(Screen):

    screen_props = DictProperty({})

    def __init__(self, **kwargs):
        self.register_event_type('on_back_pressed')
        self.register_event_type('on_menu_pressed')
        super(NormalScreen, self).__init__(**kwargs)

        for prop in self.screen_props:
            setattr(self, prop, self.screen_props[prop])

    def on_back_pressed(self, *args):
        # App.get_running_app().previous()
        pass

    def on_menu_pressed(self, *args):
        pass
