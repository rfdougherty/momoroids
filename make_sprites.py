#!/usr/bin/env python

import numpy as np
#import matplotlib.pyplot as plt
# Need the scikit-image module
#from skimage import io, transform
from glob import glob
from skimage.filters import sobel
from skimage.morphology import watershed
from scipy import ndimage
from skimage.util.montage import montage2d
import png

imdir = 'stim/'
ourdir = 'images/'

#ic = io.imread_collection(glob('/home/bobd/git/js_games/stim/*.bmp'))

def get_mask(img, mask_thresh=1):
    if len(img.shape)>2:
        img = img.mean(axis=2)
    if not mask_thresh:
        mask_thresh = np.percentile(img, 20.0)
    el_map = sobel(img)
    markers = np.zeros_like(img)
    markers[img<1] = 1
    markers[img>1] = 2
    mask = watershed(el_map, markers)
    mask = ndimage.binary_fill_holes(mask - 1)
    mask = ndimage.binary_closing(mask, structure=np.ones((7,7)))
    mask = ndimage.binary_fill_holes(mask)
    mask, _ = ndimage.label(mask)
    obj_label = np.percentile(mask[mask>0],51)
    mask = mask==obj_label
    return mask

def autocrop(img, mask, pad=0, preserve_aspect=True):
    '''Crop a numpy array to within pad voxels of non-zero data.'''
    xlim = np.argwhere(mask.sum(axis=1))[[0,-1]].squeeze()
    xlim = np.hstack((np.max((0,xlim[0]-pad)), np.min((mask.shape[0],xlim[1]+pad))))
    ylim = np.argwhere(mask.sum(axis=0))[[0,-1]].squeeze()
    ylim = np.hstack((np.max((0,ylim[0]-pad)),np.min((mask.shape[1],ylim[1]+pad))))
    if preserve_aspect:
        d = (np.diff(xlim)-np.diff(ylim))[0]
        sc = abs(d)/2.
        if d<0:
            xlim += [-np.floor(sc), np.ceil(sc)]
            if xlim[0]<pad:
                p = pad-xlim[0]
                xlim[0] += p
                xlim[1] += p
                img = np.insert(img, np.zeros(p), 0, axis=0)
            if xlim[1]>img.shape[0]-pad:
                p = xlim[1] - (img.shape[0]-pad)
                img = np.insert(img, np.zeros(p)+img.shape[0], 0, axis=0)
        elif d>0:
            ylim += [-np.floor(sc), np.ceil(sc)]
            if ylim[0]<pad:
                p = pad-ylim[0]
                ylim[0] += p
                ylim[1] += p
                img = np.insert(img, np.zeros(p), 0, axis=1)
            if ylim[1]>img.shape[1]-pad:
                p = ylim[1] - (img.shape[1]-pad)
                img = np.insert(img, np.zeros(p)+img.shape[1], 0, axis=1)

    img =  img[xlim[0]:xlim[1], ylim[0]:ylim[1], :]
    return img

def montage(vol, ncols=None):
    """Returns a 2d image monage given a 3d volume."""
    ncols = ncols if ncols else int(np.ceil(np.sqrt(vol.shape[2])))
    rows = np.array_split(vol, range(ncols,vol.shape[2],ncols), axis=2)
    # ensure the last row is the same size as the others
    rows[-1] = np.dstack((rows[-1], np.zeros(rows[-1].shape[0:2] + (rows[0].shape[2]-rows[-1].shape[2],))))
    im = np.vstack([np.squeeze(np.hstack(np.dsplit(row, ncols))) for row in rows])
    return(im)

out_sz = (128,128)
ncat = 4
nobj = 2
nview = 7
out_array = np.zeros(out_sz+(4,nobj*nview,), dtype=np.uint8)
for cat in xrange(0,ncat):
    all_mask = 0
    img = {}
    mask = {}
    for view in xrange(0,nview):
        for obj in xrange(0,nobj):
            # Replace with png
            img[(view,obj)] =  io.imread(imdir + 'C%dO%dV%d.bmp' %(cat+1,obj+1,view+1))
            mask[(view,obj)] = get_mask(img[(view,obj)])
            all_mask += mask[(view,obj)]
    for view in xrange(0,nview):
        for obj in xrange(0,nobj):
            alpha = ndimage.gaussian_filter(np.atleast_3d(mask[(view,obj)].astype(np.float)*255), sigma=1)
            #alpha[np.atleast_3d(mask)] = 255
            img = np.append(img[(view,obj)], alpha, axis=2)
            img = autocrop(img[(view,obj)], all_mask, pad=3)
            s = np.min(np.array(out_sz,dtype=float) / img.shape[0:1])
            out_array[...,(view*nobj)+obj] = ndimage.zoom(img, (s, s, 1)).round().astype(np.uint8)
            #out_array[...,(view*nobj)+obj] = transform.resize(img[(view,obj)], out_sz, order=5).round().astype(np.uint8)
    #r = montage2d(np.squeeze(out_array[:,:,0,:]).transpose((2,0,1)), grid_shape=(nview,nobj)).astype(np.uint8)
    #g = montage2d(np.squeeze(out_array[:,:,1,:]).transpose((2,0,1)), grid_shape=(nview,nobj)).astype(np.uint8)
    #b = montage2d(np.squeeze(out_array[:,:,2,:]).transpose((2,0,1)), grid_shape=(nview,nobj)).astype(np.uint8)
    #a = montage2d(np.squeeze(out_array[:,:,3,:]).transpose((2,0,1)), grid_shape=(nview,nobj)).astype(np.uint8)
    r = montage(np.squeeze(out_array[:,:,0,:]), ncols=nview)
    g = montage(np.squeeze(out_array[:,:,1,:]), ncols=nview)
    b = montage(np.squeeze(out_array[:,:,2,:]), ncols=nview)
    a = montage(np.squeeze(out_array[:,:,3,:]), ncols=nview)

    rows = np.dstack((r,g,b,a))
    png_writer = png.Writer(width = r.shape[0], height = r.shape[1], alpha = 'RGBA') # create writer
    with open(outdir + 'C%d.png' %(cat+1,), 'wb') as fp:
        png_writer.write(fp, rows.reshape(rows.shape[0], rows.shape[1]*rows.shape[2]))
        # we have to reshape or flatten the most inner arrays so write can properly understand the format

    #io.imsave(outdir + 'C%d.png' %(cat+1,), np.dstack((r,g,b,a)))


