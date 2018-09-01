from fwidgets.f_boxlayout import FBoxLayout
from kivy.properties import StringProperty, ListProperty

from kivy.lang import Builder
Builder.load_file('./GUI/texturechoice.kv')

class TextureChoice(FBoxLayout):
    source = StringProperty('')
    resolution = ListProperty([])

    def on_source(self,*args):
        self.texture.wrap = 'repeat'
        self.texture.uvsize = (1., 1.)
