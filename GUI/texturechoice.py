from fwidgets.f_boxlayout import FBoxLayout
from kivy.properties import StringProperty, ListProperty, ObjectProperty

from kivy.lang import Builder
Builder.load_file('./GUI/texturechoice.kv')


class TextureChoice(FBoxLayout):
    source = StringProperty(None)
    resolution = ListProperty([24, 48])
    texture = ObjectProperty(None)

    def change_source(self, *args):
        self.source = 'textures/%s' % str(self.ids.spinner.text)

    def on_source(self, *args):
        self.ids.img.source = self.source
        self.ids.img.texture.wrap = 'repeat'
        self.ids.img.texture.uvsize = (1., 1.)
        self.texture = self.ids.img.texture
