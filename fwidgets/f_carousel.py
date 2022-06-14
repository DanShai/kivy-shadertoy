'''
Created on Jul 7, 2016

@author: dan
'''
from kivy.uix.carousel import Carousel

from .f_widget import FWidget


class FCarousel(Carousel, FWidget):

    def __init__(self, **kwargs):

        super(FCarousel, self).__init__(**kwargs)
